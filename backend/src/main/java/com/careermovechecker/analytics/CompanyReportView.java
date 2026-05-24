package com.careermovechecker.analytics;

import com.careermovechecker.risk.RiskLevel;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "company_report_views")
public class CompanyReportView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_number", nullable = false, length = 16)
    private String companyNumber;

    @Column(name = "company_name", length = 512)
    private String companyName;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", length = 16)
    private RiskLevel riskLevel;

    @Column(name = "anonymous_session_id", length = 64)
    private String anonymousSessionId;

    @Column(length = 32)
    private String source;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String v) { companyName = v; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer v) { riskScore = v; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel v) { riskLevel = v; }
    public String getAnonymousSessionId() { return anonymousSessionId; }
    public void setAnonymousSessionId(String v) { anonymousSessionId = v; }
    public String getSource() { return source; }
    public void setSource(String v) { source = v; }
    public Instant getCreatedAt() { return createdAt; }
}
