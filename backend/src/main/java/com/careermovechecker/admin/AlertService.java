package com.careermovechecker.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AlertService {

    private final DownstreamAlertRepository repo;
    private final ObjectMapper mapper;

    public AlertService(DownstreamAlertRepository repo, ObjectMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public DownstreamAlert raise(String provider,
                                 String endpoint,
                                 String companyNumber,
                                 String companyName,
                                 DownstreamAlert.AlertType type,
                                 DownstreamAlert.Severity severity,
                                 String title,
                                 String message,
                                 Map<String, Object> evidence) {
        DownstreamAlert alert = new DownstreamAlert();
        alert.setProvider(provider);
        alert.setEndpoint(endpoint);
        alert.setCompanyNumber(companyNumber);
        alert.setCompanyName(companyName);
        alert.setAlertType(type);
        alert.setSeverity(severity);
        alert.setStatus(DownstreamAlert.Status.OPEN);
        alert.setTitle(title);
        alert.setMessage(message);
        alert.setEvidenceJson(serialize(evidence));
        Instant now = Instant.now();
        alert.setFirstSeenAt(now);
        alert.setLastSeenAt(now);
        alert.setUpdatedAt(now);
        return repo.save(alert);
    }

    public List<DownstreamAlert> list() {
        return repo.findAllByOrderByLastSeenAtDesc();
    }

    public long openCount() {
        return repo.countByStatus(DownstreamAlert.Status.OPEN);
    }

    @Transactional
    public Optional<DownstreamAlert> act(Long id, String action) {
        return repo.findById(id).map(a -> {
            Instant now = Instant.now();
            switch (action) {
                case "acknowledge" -> {
                    a.setStatus(DownstreamAlert.Status.ACKNOWLEDGED);
                    a.setAcknowledgedAt(now);
                }
                case "resolve" -> {
                    a.setStatus(DownstreamAlert.Status.RESOLVED);
                    a.setResolvedAt(now);
                }
                case "suppress" -> {
                    a.setStatus(DownstreamAlert.Status.SUPPRESSED);
                    a.setSuppressedUntil(now.plusSeconds(86_400));
                }
                case "retry" -> a.setLastSeenAt(now);
                default -> {}
            }
            a.setUpdatedAt(now);
            return repo.save(a);
        });
    }

    private String serialize(Map<String, Object> evidence) {
        try {
            return mapper.writeValueAsString(evidence == null ? Map.of() : evidence);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
