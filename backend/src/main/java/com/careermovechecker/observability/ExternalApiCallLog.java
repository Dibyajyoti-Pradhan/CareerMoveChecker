package com.careermovechecker.observability;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "external_api_call_logs")
public class ExternalApiCallLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String provider;

    @Column(nullable = false, length = 256)
    private String endpoint;

    @Column(name = "company_number", length = 16)
    private String companyNumber;

    @Column(name = "status_code", nullable = false)
    private int statusCode;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "duration_ms", nullable = false)
    private int durationMs;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getProvider() { return provider; }
    public void setProvider(String v) { provider = v; }
    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String v) { endpoint = v; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public int getStatusCode() { return statusCode; }
    public void setStatusCode(int v) { statusCode = v; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean v) { success = v; }
    public int getDurationMs() { return durationMs; }
    public void setDurationMs(int v) { durationMs = v; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String v) { errorMessage = v; }
    public Instant getCreatedAt() { return createdAt; }
}
