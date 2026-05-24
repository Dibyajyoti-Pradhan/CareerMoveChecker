package com.careermovechecker.analytics;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "company_search_events")
public class CompanySearchEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 512)
    private String query;

    @Column(name = "normalized_query", nullable = false, length = 512)
    private String normalizedQuery;

    @Column(name = "result_count", nullable = false)
    private int resultCount;

    @Column(name = "selected_company_number", length = 16)
    private String selectedCompanyNumber;

    @Column(name = "selected_company_name", length = 512)
    private String selectedCompanyName;

    @Column(name = "anonymous_session_id", length = 64)
    private String anonymousSessionId;

    @Column(name = "ip_hash", length = 128)
    private String ipHash;

    @Column(name = "user_agent_hash", length = 128)
    private String userAgentHash;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getQuery() { return query; }
    public void setQuery(String v) { query = v; }
    public String getNormalizedQuery() { return normalizedQuery; }
    public void setNormalizedQuery(String v) { normalizedQuery = v; }
    public int getResultCount() { return resultCount; }
    public void setResultCount(int v) { resultCount = v; }
    public String getSelectedCompanyNumber() { return selectedCompanyNumber; }
    public void setSelectedCompanyNumber(String v) { selectedCompanyNumber = v; }
    public String getSelectedCompanyName() { return selectedCompanyName; }
    public void setSelectedCompanyName(String v) { selectedCompanyName = v; }
    public String getAnonymousSessionId() { return anonymousSessionId; }
    public void setAnonymousSessionId(String v) { anonymousSessionId = v; }
    public String getIpHash() { return ipHash; }
    public void setIpHash(String v) { ipHash = v; }
    public String getUserAgentHash() { return userAgentHash; }
    public void setUserAgentHash(String v) { userAgentHash = v; }
    public Instant getCreatedAt() { return createdAt; }
}
