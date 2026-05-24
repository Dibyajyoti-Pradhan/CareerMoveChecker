package com.careermovechecker.admin;

import com.careermovechecker.analytics.CompanyReportViewRepository;
import com.careermovechecker.analytics.CompanySearchEventRepository;
import com.careermovechecker.analytics.FeedbackEvent;
import com.careermovechecker.analytics.FeedbackEventRepository;
import com.careermovechecker.company.CompanyRiskReportRepository;
import com.careermovechecker.observability.ExternalApiCallLogRepository;
import com.careermovechecker.risk.RiskLevel;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CompanySearchEventRepository searches;
    private final CompanyReportViewRepository viewsRepo;
    private final FeedbackEventRepository feedback;
    private final CompanyRiskReportRepository reports;
    private final ExternalApiCallLogRepository apiLogs;
    private final AlertService alerts;

    public AdminController(CompanySearchEventRepository searches,
                           CompanyReportViewRepository viewsRepo,
                           FeedbackEventRepository feedback,
                           CompanyRiskReportRepository reports,
                           ExternalApiCallLogRepository apiLogs,
                           AlertService alerts) {
        this.searches = searches;
        this.viewsRepo = viewsRepo;
        this.feedback = feedback;
        this.reports = reports;
        this.apiLogs = apiLogs;
        this.alerts = alerts;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        Instant now = Instant.now();
        Instant today = now.minus(Duration.ofHours(24));
        Instant d7 = now.minus(Duration.ofDays(7));
        Instant d30 = now.minus(Duration.ofDays(30));

        long searchesToday = searches.countByCreatedAtAfter(today);
        long searches7d = searches.countByCreatedAtAfter(d7);
        long searches30d = searches.countByCreatedAtAfter(d30);
        long noResults7d = searches.countByResultCountAndCreatedAtAfter(0, d7);
        long views7d = viewsRepo.countByCreatedAtAfter(d7);
        long success7d = apiLogs.countSuccessSince(d7);
        long total7d = apiLogs.countAllSince(d7);
        long errors7d = apiLogs.countErrorsSince(d7);
        Double avgLatency = apiLogs.avgDurationSince(d7);
        long openAlerts = alerts.openCount();

        Map<RiskLevel, Long> dist = new EnumMap<>(RiskLevel.class);
        for (RiskLevel l : RiskLevel.values()) dist.put(l, 0L);
        reports.riskDistributionSince(d30).forEach(r -> dist.put(r.getLevel(), r.getCount()));

        Map<FeedbackEvent.UseCase, Long> fb = new EnumMap<>(FeedbackEvent.UseCase.class);
        for (FeedbackEvent.UseCase uc : FeedbackEvent.UseCase.values()) fb.put(uc, 0L);
        feedback.breakdown(d7).forEach(r -> fb.put(r.getUseCase(), r.getCnt()));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("searchesToday", searchesToday);
        out.put("searches7d", searches7d);
        out.put("searches30d", searches30d);
        out.put("reportsViewed7d", views7d);
        out.put("searchToReportConversion", searches7d == 0 ? 0.0 : (double) views7d / searches7d);
        out.put("noResultSearches7d", noResults7d);
        out.put("apiSuccessRate7d", total7d == 0 ? 1.0 : (double) success7d / total7d);
        out.put("avgApiLatencyMs", avgLatency == null ? 0 : avgLatency.intValue());
        out.put("errorCount7d", errors7d);
        out.put("openAlerts", openAlerts);
        out.put("riskDistribution", dist);
        out.put("topSearched", searches.topSearched(d7, PageRequest.of(0, 10)));
        out.put("topViewed", viewsRepo.topViewed(d7, PageRequest.of(0, 10)));
        out.put("feedbackBreakdown", fb);
        return out;
    }

    @GetMapping("/searches")
    public List<?> recentSearches() {
        return searches.findAll(PageRequest.of(0, 50)).getContent();
    }

    @GetMapping("/reports")
    public List<?> recentReports() {
        return reports.findTop10ByOrderByUpdatedAtDesc();
    }

    @GetMapping("/api-health")
    public Map<String, Object> apiHealth() {
        Instant d7 = Instant.now().minus(Duration.ofDays(7));
        long success = apiLogs.countSuccessSince(d7);
        long total = apiLogs.countAllSince(d7);
        Double avg = apiLogs.avgDurationSince(d7);
        long errors = apiLogs.countErrorsSince(d7);
        return Map.of(
                "successRate", total == 0 ? 1.0 : (double) success / total,
                "avgLatencyMs", avg == null ? 0 : avg.intValue(),
                "errors", errors
        );
    }

    @GetMapping("/alerts")
    public List<DownstreamAlert> listAlerts() {
        return alerts.list();
    }

    @PostMapping("/alerts/{id}/acknowledge")
    public ResponseEntity<DownstreamAlert> acknowledge(@PathVariable Long id) {
        return alerts.act(id, "acknowledge").map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<DownstreamAlert> resolve(@PathVariable Long id) {
        return alerts.act(id, "resolve").map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/alerts/{id}/suppress")
    public ResponseEntity<DownstreamAlert> suppress(@PathVariable Long id) {
        return alerts.act(id, "suppress").map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/alerts/{id}/retry")
    public ResponseEntity<DownstreamAlert> retry(@PathVariable Long id) {
        return alerts.act(id, "retry").map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
