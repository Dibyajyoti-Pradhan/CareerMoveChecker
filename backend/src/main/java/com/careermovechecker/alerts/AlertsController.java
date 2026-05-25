package com.careermovechecker.alerts;

import com.careermovechecker.config.AdminProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertsController {

    private final AlertsService service;
    private final AdminProperties admin;

    public AlertsController(AlertsService service, AdminProperties admin) {
        this.service = service;
        this.admin = admin;
    }

    public record AlertDto(
            Long id, String companyNumber, String companyName,
            String severity, String alertType, String title, String description,
            Map<String, String> meansByPersona,
            boolean unread,
            String when
    ) {}

    public record FeedGroup(String day, List<AlertDto> items) {}

    public record FeedResponse(List<FeedGroup> groups, long unread, int totalCount) {}

    @GetMapping
    public FeedResponse feed() {
        List<WatchListAlert> raw = service.list();
        Map<String, List<AlertDto>> grouped = new LinkedHashMap<>();
        for (WatchListAlert a : raw) {
            String day = bucketDay(a);
            grouped.computeIfAbsent(day, k -> new java.util.ArrayList<>()).add(toDto(a));
        }
        List<FeedGroup> groups = grouped.entrySet().stream()
                .map(e -> new FeedGroup(e.getKey(), e.getValue()))
                .toList();
        return new FeedResponse(groups, service.unreadCount(), raw.size());
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead() {
        service.markAllRead();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        service.markRead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/run-poll")
    public ResponseEntity<Map<String, Object>> runPoll(@RequestHeader(value = "X-Admin-Password", required = false) String pwd) {
        if (pwd == null || !pwd.equals(admin.getPassword())) return ResponseEntity.status(401).build();
        service.pollWatchList();
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private String bucketDay(WatchListAlert a) {
        LocalDate today = LocalDate.now(ZoneId.of("Europe/London"));
        LocalDate when = a.getOccurredAt().atZone(ZoneId.of("Europe/London")).toLocalDate();
        long days = java.time.temporal.ChronoUnit.DAYS.between(when, today);
        if (days == 0) return "Today";
        if (days == 1) return "Yesterday";
        if (days <= 7) return "Earlier this week";
        if (days <= 30) return "Earlier this month";
        return when.format(DateTimeFormatter.ofPattern("MMM yyyy"));
    }

    private AlertDto toDto(WatchListAlert a) {
        return new AlertDto(
                a.getId(),
                a.getCompanyNumber(),
                a.getCompanyName(),
                a.getSeverity().name().toLowerCase(),
                a.getAlertType().name(),
                a.getTitle(),
                a.getDescription(),
                Map.of(
                        "candidate", nz(a.getMeansCandidate()),
                        "freelancer", nz(a.getMeansFreelancer()),
                        "agency", nz(a.getMeansAgency())
                ),
                a.isUnread(),
                a.getOccurredAt().toString()
        );
    }

    private String nz(String s) { return s == null ? "" : s; }
}
