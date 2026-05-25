package com.careermovechecker.alerts;

import com.careermovechecker.companieshouse.CompaniesHouseClient;
import com.careermovechecker.saved.SavedCompany;
import com.careermovechecker.saved.SavedCompanyRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AlertsService {

    private static final Logger log = LoggerFactory.getLogger(AlertsService.class);

    private final SavedCompanyRepository saved;
    private final CompaniesHouseClient ch;
    private final WatchListAlertRepository alerts;
    private final WatchListStateRepository state;
    private final ObjectMapper json;

    public AlertsService(SavedCompanyRepository saved,
                         CompaniesHouseClient ch,
                         WatchListAlertRepository alerts,
                         WatchListStateRepository state,
                         ObjectMapper json) {
        this.saved = saved;
        this.ch = ch;
        this.alerts = alerts;
        this.state = state;
        this.json = json;
    }

    // Every 10 minutes — adjust via prod env later
    @Scheduled(fixedDelayString = "${cmc.alerts.poll-interval-ms:600000}", initialDelay = 30_000)
    @Transactional
    public void pollWatchList() {
        List<SavedCompany> list = saved.findAll();
        if (list.isEmpty()) return;
        log.info("AlertsService poll — {} saved companies", list.size());
        for (SavedCompany s : list) {
            try {
                pollOne(s);
            } catch (Exception e) {
                log.warn("Poll failed for {}", s.getCompanyNumber(), e);
            }
        }
    }

    private void pollOne(SavedCompany s) {
        String n = s.getCompanyNumber();
        WatchListState st = state.findById(n).orElseGet(() -> {
            WatchListState fresh = new WatchListState();
            fresh.setCompanyNumber(n);
            return fresh;
        });

        // --- status change ---
        ch.profile(n).ifPresent(profile -> {
            String newStatus = profile.path("company_status").asText(null);
            if (newStatus != null && st.getLastStatus() != null && !newStatus.equals(st.getLastStatus())) {
                emitStatusChange(s, st.getLastStatus(), newStatus);
            }
            if (newStatus != null) st.setLastStatus(newStatus);
        });

        // --- insolvency openings ---
        ch.insolvency(n).ifPresent(ins -> {
            JsonNode cases = ins.path("cases");
            if (cases.isArray() && cases.size() > 0) {
                emitInsolvency(s, cases.size());
            }
        });

        // --- new filings since last seen ---
        ch.filingHistory(n).ifPresent(fh -> {
            JsonNode items = fh.path("items");
            if (!items.isArray() || items.isEmpty()) return;
            JsonNode latest = items.get(0);
            String latestId = latest.path("transaction_id").asText(null);
            LocalDate latestDate = parseDate(latest.path("date").asText(null));
            String latestType = latest.path("type").asText(null);
            String latestCategory = latest.path("category").asText(null);
            String latestDesc = latest.path("description").asText(null);

            if (st.getLastFilingTxnId() == null) {
                // first run — seed but don't emit (avoid spamming on first watch)
            } else if (latestId != null && !latestId.equals(st.getLastFilingTxnId())) {
                emitNewFiling(s, latestType, latestCategory, latestDesc, latestDate);
            }
            if (latestId != null) st.setLastFilingTxnId(latestId);
            if (latestDate != null) st.setLastFilingDate(latestDate);
        });

        Instant now = Instant.now();
        st.setLastPolledAt(now);
        st.setUpdatedAt(now);
        state.save(st);
    }

    private void emitStatusChange(SavedCompany s, String oldStatus, String newStatus) {
        boolean bad = newStatus.contains("liquidation") || newStatus.contains("administration") || newStatus.equals("dissolved");
        WatchListAlert a = base(s,
                bad ? WatchListAlert.Severity.BAD : WatchListAlert.Severity.WARN,
                WatchListAlert.AlertType.STATUS_CHANGE,
                "Status changed: " + oldStatus + " → " + newStatus,
                "Company status updated at Companies House.");
        a.setMeansCandidate(bad ? "Do not sign. Likely employer collapse." : "Verify before signing.");
        a.setMeansFreelancer(bad ? "Stop work. Existing invoices at risk." : "Check before extending credit.");
        a.setMeansAgency(bad ? "Pull active placements. Fee at serious risk." : "Move to watch list.");
        a.setEvidenceJson(serialize(Map.of("old", oldStatus, "new", newStatus)));
        alerts.save(a);
    }

    private void emitInsolvency(SavedCompany s, int caseCount) {
        WatchListAlert a = base(s, WatchListAlert.Severity.BAD,
                WatchListAlert.AlertType.INSOLVENCY_OPENED,
                "Insolvency case on file (" + caseCount + ")",
                "One or more insolvency cases registered.");
        a.setMeansCandidate("Do not sign. Likely employer collapse.");
        a.setMeansFreelancer("Stop work. Existing invoices at risk.");
        a.setMeansAgency("Active placements at risk · fees in jeopardy.");
        a.setEvidenceJson(serialize(Map.of("cases", caseCount)));
        alerts.save(a);
    }

    private void emitNewFiling(SavedCompany s, String type, String category, String description, LocalDate date) {
        var sev = severityFor(type, category);
        WatchListAlert a = base(s, sev,
                WatchListAlert.AlertType.FILING,
                "New filing: " + (type != null ? type : "—") + " (" + (category != null ? category : "—") + ")",
                description != null ? description : "New filing registered.");
        a.setMeansCandidate("Worth a glance.");
        a.setMeansFreelancer("Check the report for context before next invoice.");
        a.setMeansAgency("Note before next placement.");
        a.setEvidenceJson(serialize(Map.of("type", type, "category", category, "date", String.valueOf(date))));
        alerts.save(a);
    }

    private WatchListAlert.Severity severityFor(String type, String category) {
        if (category == null) return WatchListAlert.Severity.INFO;
        String c = category.toLowerCase();
        if (c.contains("insolvency") || c.contains("liquidation")) return WatchListAlert.Severity.BAD;
        if (type != null && (type.toUpperCase().startsWith("GAZ") || type.equalsIgnoreCase("DS01"))) return WatchListAlert.Severity.BAD;
        if (c.contains("officers") || c.contains("mortgage")) return WatchListAlert.Severity.WARN;
        if (c.contains("accounts") || c.contains("confirmation")) return WatchListAlert.Severity.OK;
        return WatchListAlert.Severity.INFO;
    }

    private WatchListAlert base(SavedCompany s, WatchListAlert.Severity sev, WatchListAlert.AlertType type,
                                String title, String description) {
        WatchListAlert a = new WatchListAlert();
        a.setCompanyNumber(s.getCompanyNumber());
        a.setCompanyName(s.getCompanyName());
        a.setSeverity(sev);
        a.setAlertType(type);
        a.setTitle(title);
        a.setDescription(description);
        a.setUnread(true);
        a.setOccurredAt(Instant.now());
        return a;
    }

    private String serialize(Object o) {
        try { return json.writeValueAsString(o); } catch (JsonProcessingException e) { return "{}"; }
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); } catch (Exception e) { return null; }
    }

    public List<WatchListAlert> list() {
        return alerts.findTop200ByOrderByOccurredAtDesc();
    }

    public long unreadCount() {
        return alerts.countByUnread(true);
    }

    public void markAllRead() {
        alerts.findAll().forEach(a -> { if (a.isUnread()) { a.setUnread(false); alerts.save(a); } });
    }

    public void markRead(Long id) {
        alerts.findById(id).ifPresent(a -> { a.setUnread(false); alerts.save(a); });
    }
}
