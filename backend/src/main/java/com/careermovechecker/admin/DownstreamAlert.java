package com.careermovechecker.admin;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "downstream_alerts")
public class DownstreamAlert {

    public enum AlertType {
        API_FAILURE, RATE_LIMIT, TIMEOUT, MALFORMED_RESPONSE, SCHEMA_DRIFT,
        MISSING_REQUIRED_FIELD, STALE_DATA, CONTRADICTORY_DATA, PARTIAL_DATA, CACHE_REFRESH_FAILED
    }

    public enum Severity { INFO, WARNING, CRITICAL }

    public enum Status { OPEN, ACKNOWLEDGED, RESOLVED, SUPPRESSED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String provider;

    @Column(nullable = false, length = 256)
    private String endpoint;

    @Column(name = "company_number", length = 16)
    private String companyNumber;

    @Column(name = "company_name", length = 512)
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 40)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status = Status.OPEN;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence_json", nullable = false, columnDefinition = "jsonb")
    private String evidenceJson;

    @Column(name = "first_seen_at", nullable = false)
    private Instant firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "suppressed_until")
    private Instant suppressedUntil;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Long getId() { return id; }
    public String getProvider() { return provider; }
    public void setProvider(String v) { provider = v; }
    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String v) { endpoint = v; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String v) { companyName = v; }
    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType v) { alertType = v; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity v) { severity = v; }
    public Status getStatus() { return status; }
    public void setStatus(Status v) { status = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { title = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { message = v; }
    public String getEvidenceJson() { return evidenceJson; }
    public void setEvidenceJson(String v) { evidenceJson = v; }
    public Instant getFirstSeenAt() { return firstSeenAt; }
    public void setFirstSeenAt(Instant v) { firstSeenAt = v; }
    public Instant getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(Instant v) { lastSeenAt = v; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant v) { acknowledgedAt = v; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant v) { resolvedAt = v; }
    public Instant getSuppressedUntil() { return suppressedUntil; }
    public void setSuppressedUntil(Instant v) { suppressedUntil = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant v) { updatedAt = v; }
}
