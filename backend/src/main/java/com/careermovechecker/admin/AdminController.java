package com.careermovechecker.admin;

import com.careermovechecker.alerts.AlertsService;
import com.careermovechecker.alerts.WatchListAlert;
import com.careermovechecker.analytics.CompanyReportViewRepository;
import com.careermovechecker.analytics.CompanySearchEventRepository;
import com.careermovechecker.analytics.FeedbackEvent;
import com.careermovechecker.analytics.FeedbackEventRepository;
import com.careermovechecker.company.CompanyRiskReport;
import com.careermovechecker.company.CompanyRiskReportRepository;
import com.careermovechecker.company.CompanyService;
import com.careermovechecker.observability.ExternalApiCallLog;
import com.careermovechecker.observability.ExternalApiCallLogRepository;
import com.careermovechecker.risk.RiskLevel;
import com.careermovechecker.saved.SavedCompany;
import com.careermovechecker.saved.SavedCompanyRepository;
import com.careermovechecker.tracking.CtaClickRepository;
import com.careermovechecker.tracking.PageViewRepository;
import com.careermovechecker.waitlist.WaitlistRepository;
import com.careermovechecker.waitlist.WaitlistSignup;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CompanySearchEventRepository searches;
    private final CompanyReportViewRepository viewsRepo;
    private final FeedbackEventRepository feedback;
    private final CompanyRiskReportRepository reports;
    private final ExternalApiCallLogRepository apiLogs;
    private final AlertService alerts;
    private final SavedCompanyRepository saved;
    private final AlertsService watchAlerts;
    private final SettingsService settings;
    private final KillSwitchService kills;
    private final AuditService audit;
    private final CompanyService companyService;
    private final PageViewRepository pageViews;
    private final CtaClickRepository ctaClicks;
    private final WaitlistRepository waitlist;

    public AdminController(CompanySearchEventRepository searches,
                           CompanyReportViewRepository viewsRepo,
                           FeedbackEventRepository feedback,
                           CompanyRiskReportRepository reports,
                           ExternalApiCallLogRepository apiLogs,
                           AlertService alerts,
                           SavedCompanyRepository saved,
                           AlertsService watchAlerts,
                           SettingsService settings,
                           KillSwitchService kills,
                           AuditService audit,
                           CompanyService companyService,
                           PageViewRepository pageViews,
                           CtaClickRepository ctaClicks,
                           WaitlistRepository waitlist) {
        this.searches = searches;
        this.viewsRepo = viewsRepo;
        this.feedback = feedback;
        this.reports = reports;
        this.apiLogs = apiLogs;
        this.alerts = alerts;
        this.saved = saved;
        this.watchAlerts = watchAlerts;
        this.settings = settings;
        this.kills = kills;
        this.audit = audit;
        this.companyService = companyService;
        this.pageViews = pageViews;
        this.ctaClicks = ctaClicks;
        this.waitlist = waitlist;
    }

    // ============ DEMAND SIGNAL ============

    @GetMapping("/funnel")
    public Map<String, Object> funnel(@RequestParam(value = "range", defaultValue = "7d") String range) {
        Instant since = parseRange(range, Instant.now());
        long sessions = pageViews.countDistinctSessionsSince(since);
        long landed = pageViews.countSessionsForPath("/", since);
        long visitedPersonaPage = pageViews.countSessionsForPathPrefix("/for-%", since);
        long visitedPricing = pageViews.countSessionsForPath("/pricing", since);
        long visitedSearch = pageViews.countSessionsForPath("/app/search", since);
        long visitedReport = pageViews.countSessionsForPathPrefix("/app/company/%", since);
        long ctaWaitlist = ctaClicks.topCtas(since).stream()
                .filter(c -> c.getCtaId() != null && c.getCtaId().startsWith("waitlist"))
                .mapToLong(c -> c.getCnt()).sum();
        long waitlistSignups = waitlist.countByCreatedAtAfter(since);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("range", range);
        out.put("totalSessions", sessions);
        out.put("steps", List.of(
                Map.of("name", "Landed (/)", "sessions", landed),
                Map.of("name", "Visited persona page", "sessions", visitedPersonaPage),
                Map.of("name", "Visited pricing", "sessions", visitedPricing),
                Map.of("name", "Ran a search", "sessions", visitedSearch),
                Map.of("name", "Opened a report", "sessions", visitedReport),
                Map.of("name", "Clicked waitlist CTA", "sessions", ctaWaitlist),
                Map.of("name", "Submitted email", "sessions", waitlistSignups)
        ));
        out.put("topPaths", pageViews.topPaths(since, PageRequest.of(0, 15)));
        out.put("topReferrers", pageViews.topReferrers(since));
        out.put("topCtas", ctaClicks.topCtas(since));
        out.put("pageViewsByDay", pageViews.byDay(since));
        return out;
    }

    @GetMapping("/waitlist")
    public Map<String, Object> waitlistList(@RequestParam(value = "page", defaultValue = "0") int page,
                                            @RequestParam(value = "size", defaultValue = "100") int size) {
        var p = waitlist.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("items", p.getContent());
        out.put("page", p.getNumber());
        out.put("size", p.getSize());
        out.put("totalElements", p.getTotalElements());
        out.put("totalPages", p.getTotalPages());
        out.put("byTier", waitlist.countByTier());
        out.put("byPersona", waitlist.countByPersona());
        return out;
    }

    @GetMapping(value = "/waitlist.csv", produces = "text/csv")
    public ResponseEntity<String> waitlistCsv() {
        StringBuilder sb = new StringBuilder("email,persona,tier,role,referrer,landing_path,created_at\n");
        for (WaitlistSignup w : waitlist.findAll()) {
            sb.append(csv(w.getEmail())).append(',')
              .append(csv(w.getPersona())).append(',')
              .append(csv(w.getTier())).append(',')
              .append(csv(w.getRole())).append(',')
              .append(csv(w.getReferrer())).append(',')
              .append(csv(w.getLandingPath())).append(',')
              .append(csv(String.valueOf(w.getCreatedAt())))
              .append('\n');
        }
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=waitlist.csv")
                .body(sb.toString());
    }

    private static String csv(String s) {
        if (s == null) return "";
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    // ============ OVERVIEW ============

    @GetMapping("/summary")
    public Map<String, Object> summary(@RequestParam(value = "range", defaultValue = "7d") String range) {
        Instant now = Instant.now();
        Instant today = now.minus(Duration.ofHours(24));
        Instant since = parseRange(range, now);
        Instant d7 = now.minus(Duration.ofDays(7));
        Instant d30 = now.minus(Duration.ofDays(30));

        long searchesToday = searches.countByCreatedAtAfter(today);
        long searchesIn = searches.countByCreatedAtAfter(since);
        long searches7d = searches.countByCreatedAtAfter(d7);
        long searches30d = searches.countByCreatedAtAfter(d30);
        long noResults = searches.countByResultCountAndCreatedAtAfter(0, since);
        long views = viewsRepo.countByCreatedAtAfter(since);
        long success = apiLogs.countSuccessSince(since);
        long total = apiLogs.countAllSince(since);
        long errors = apiLogs.countErrorsSince(since);
        Double avg = apiLogs.avgDurationSince(since);

        Map<RiskLevel, Long> dist = new EnumMap<>(RiskLevel.class);
        for (RiskLevel l : RiskLevel.values()) dist.put(l, 0L);
        reports.riskDistributionSince(d30).forEach(r -> dist.put(r.getLevel(), r.getCount()));

        Map<FeedbackEvent.UseCase, Long> fb = new EnumMap<>(FeedbackEvent.UseCase.class);
        for (FeedbackEvent.UseCase uc : FeedbackEvent.UseCase.values()) fb.put(uc, 0L);
        feedback.breakdown(since).forEach(r -> fb.put(r.getUseCase(), r.getCnt()));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("range", range);
        out.put("searchesToday", searchesToday);
        out.put("searchesInRange", searchesIn);
        out.put("searches7d", searches7d);
        out.put("searches30d", searches30d);
        out.put("reportsViewedInRange", views);
        out.put("searchToReportConversion", searchesIn == 0 ? 0.0 : (double) views / searchesIn);
        out.put("noResultSearches", noResults);
        out.put("apiSuccessRate", total == 0 ? 1.0 : (double) success / total);
        out.put("avgApiLatencyMs", avg == null ? 0 : avg.intValue());
        out.put("errorCount", errors);
        out.put("openDownstreamAlerts", alerts.openCount());
        out.put("openWatchAlerts", watchAlerts.unreadCount());
        out.put("totalSavedCompanies", saved.count());
        out.put("totalCachedReports", reports.count());
        out.put("riskDistribution", dist);
        out.put("topSearched", searches.topSearched(since, PageRequest.of(0, 10)));
        out.put("topViewed", viewsRepo.topViewed(since, PageRequest.of(0, 10)));
        out.put("topNoResultQueries", searches.topNoResult(since, PageRequest.of(0, 10)));
        out.put("feedbackBreakdown", fb);
        return out;
    }

    @GetMapping("/activity/searches-by-day")
    public List<?> searchesByDay(@RequestParam(value = "days", defaultValue = "30") int days) {
        return searches.searchesByDay(Instant.now().minus(Duration.ofDays(days)));
    }

    @GetMapping("/activity/views-by-day")
    public List<?> viewsByDay(@RequestParam(value = "days", defaultValue = "30") int days) {
        return viewsRepo.viewsByDay(Instant.now().minus(Duration.ofDays(days)));
    }

    @GetMapping("/searches")
    public List<?> recentSearches(@RequestParam(value = "page", defaultValue = "0") int page,
                                  @RequestParam(value = "size", defaultValue = "50") int size) {
        return searches.findAll(PageRequest.of(page, size)).getContent();
    }

    // ============ API HEALTH ============

    @GetMapping("/api-health")
    public Map<String, Object> apiHealth(@RequestParam(value = "range", defaultValue = "7d") String range) {
        Instant since = parseRange(range, Instant.now());
        long success = apiLogs.countSuccessSince(since);
        long total = apiLogs.countAllSince(since);
        Double avg = apiLogs.avgDurationSince(since);
        long errors = apiLogs.countErrorsSince(since);
        return Map.of(
                "range", range,
                "successRate", total == 0 ? 1.0 : (double) success / total,
                "avgLatencyMs", avg == null ? 0 : avg.intValue(),
                "totalRequests", total,
                "errors", errors,
                "endpoints", apiLogs.endpointStatsSince(since)
        );
    }

    @GetMapping("/logs")
    public Map<String, Object> logs(@RequestParam(value = "page", defaultValue = "0") int page,
                                    @RequestParam(value = "size", defaultValue = "50") int size) {
        var p = apiLogs.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return Map.of(
                "items", p.getContent(),
                "page", p.getNumber(),
                "size", p.getSize(),
                "totalElements", p.getTotalElements(),
                "totalPages", p.getTotalPages()
        );
    }

    // ============ DATA FRESHNESS ============

    @GetMapping("/data-freshness")
    public Map<String, Object> dataFreshness() {
        Instant now = Instant.now();
        var buckets = reports.freshnessBuckets(
                now.minus(Duration.ofHours(6)),
                now.minus(Duration.ofHours(24)),
                now.minus(Duration.ofDays(7))
        );
        return Map.of(
                "fresh6h", buckets.getFresh6h(),
                "fresh24h", buckets.getFresh24h(),
                "fresh7d", buckets.getFresh7d(),
                "stale", buckets.getStale(),
                "totalCachedReports", reports.count()
        );
    }

    // ============ COMPANIES ============

    @GetMapping("/companies")
    public Map<String, Object> companies(@RequestParam(value = "page", defaultValue = "0") int page,
                                         @RequestParam(value = "size", defaultValue = "50") int size) {
        var p = reports.findAllByOrderByUpdatedAtDesc(PageRequest.of(page, size));
        return Map.of(
                "items", p.getContent(),
                "page", p.getNumber(),
                "size", p.getSize(),
                "totalElements", p.getTotalElements(),
                "totalPages", p.getTotalPages()
        );
    }

    @GetMapping("/saved")
    public List<SavedCompany> savedAll() {
        return saved.findAll();
    }

    @GetMapping("/reports/top")
    public List<CompanyRiskReport> topReports() {
        return reports.findTop10ByOrderByUpdatedAtDesc();
    }

    // ============ DOWNSTREAM (CH data-quality) ALERTS ============

    @GetMapping("/alerts")
    public List<com.careermovechecker.admin.DownstreamAlert> listAlerts() {
        return alerts.list();
    }

    @PostMapping("/alerts/{id}/acknowledge")
    public ResponseEntity<com.careermovechecker.admin.DownstreamAlert> acknowledge(@PathVariable Long id) {
        var r = alerts.act(id, "acknowledge");
        audit.log("alert.acknowledge", "downstream_alert", String.valueOf(id), "Acknowledged alert " + id, Map.of());
        return r.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<com.careermovechecker.admin.DownstreamAlert> resolve(@PathVariable Long id) {
        var r = alerts.act(id, "resolve");
        audit.log("alert.resolve", "downstream_alert", String.valueOf(id), "Resolved alert " + id, Map.of());
        return r.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/alerts/{id}/suppress")
    public ResponseEntity<com.careermovechecker.admin.DownstreamAlert> suppress(@PathVariable Long id) {
        var r = alerts.act(id, "suppress");
        audit.log("alert.suppress", "downstream_alert", String.valueOf(id), "Suppressed alert " + id, Map.of());
        return r.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/alerts/{id}/retry")
    public ResponseEntity<com.careermovechecker.admin.DownstreamAlert> retry(@PathVariable Long id) {
        var r = alerts.act(id, "retry");
        audit.log("alert.retry", "downstream_alert", String.valueOf(id), "Retry alert " + id, Map.of());
        return r.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ============ WATCH-LIST ALERTS (admin view) ============

    @GetMapping("/watch-alerts")
    public List<WatchListAlert> watchAlertsList() {
        return watchAlerts.list();
    }

    @PostMapping("/watch-alerts/trigger-poll")
    public Map<String, Object> triggerPoll() {
        watchAlerts.pollWatchList();
        audit.log("watch_alerts.poll", "scheduler", "manual", "Manually triggered watch-list poll", Map.of());
        return Map.of("ok", true, "ranAt", Instant.now().toString());
    }

    // ============ MANUAL TRIGGERS ============

    @PostMapping("/companies/{companyNumber}/force-refresh")
    public ResponseEntity<?> forceRefresh(@PathVariable String companyNumber) {
        var r = companyService.getOrComputeReport(companyNumber, true, "admin-force-refresh");
        audit.log("company.force-refresh", "company", companyNumber, "Forced cache refresh for " + companyNumber, Map.of());
        return r.<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ============ SETTINGS ============

    @GetMapping("/settings")
    public List<AppSetting> settingsList() {
        return settings.all();
    }

    public record SettingUpdate(String value) {}

    @PutMapping("/settings/{key}")
    public ResponseEntity<AppSetting> updateSetting(@PathVariable String key, @RequestBody SettingUpdate body) {
        try {
            AppSetting s = settings.update(key, body.value(), currentActor());
            audit.log("settings.update", "setting", key, "Updated " + key + " to " + body.value(), Map.of("value", body.value()));
            return ResponseEntity.ok(s);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============ KILL SWITCHES ============

    @GetMapping("/kill-switches")
    public List<KillSwitch> killSwitchesList() {
        return kills.all();
    }

    public record KillSwitchUpdate(boolean enabled, String reason) {}

    @PutMapping("/kill-switches/{key}")
    public KillSwitch updateKillSwitch(@PathVariable String key, @RequestBody KillSwitchUpdate body) {
        KillSwitch ks = kills.set(key, body.enabled(), body.reason(), currentActor());
        audit.log("kill-switch.set", "kill_switch", key,
                "Set " + key + " = " + body.enabled(),
                Map.of("enabled", body.enabled(), "reason", body.reason() == null ? "" : body.reason()));
        return ks;
    }

    // ============ AUDIT LOG ============

    @GetMapping("/audit")
    public Map<String, Object> auditList(@RequestParam(value = "page", defaultValue = "0") int page,
                                         @RequestParam(value = "size", defaultValue = "50") int size) {
        var p = audit.recent(page, size);
        return Map.of(
                "items", p.getContent(),
                "page", p.getNumber(),
                "size", p.getSize(),
                "totalElements", p.getTotalElements(),
                "totalPages", p.getTotalPages()
        );
    }

    // ============ FEEDBACK ============

    @GetMapping("/feedback")
    public List<?> feedbackAll(@RequestParam(value = "page", defaultValue = "0") int page,
                               @RequestParam(value = "size", defaultValue = "50") int size) {
        return feedback.findAll(PageRequest.of(page, size)).getContent();
    }

    // ============ helpers ============

    private static String currentActor() {
        var a = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return a == null ? "anonymous" : a.getName();
    }

    private static Instant parseRange(String range, Instant now) {
        return switch (range) {
            case "1h" -> now.minus(Duration.ofHours(1));
            case "24h" -> now.minus(Duration.ofHours(24));
            case "30d" -> now.minus(Duration.ofDays(30));
            case "90d" -> now.minus(Duration.ofDays(90));
            default -> now.minus(Duration.ofDays(7));
        };
    }
}
