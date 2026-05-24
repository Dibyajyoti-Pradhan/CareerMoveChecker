package com.careermovechecker.company;

import com.careermovechecker.risk.RiskLevel;
import com.careermovechecker.risk.ScoringEngineType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "company_risk_reports")
public class CompanyRiskReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_number", nullable = false, length = 16, unique = true)
    private String companyNumber;

    @Column(name = "company_name", nullable = false, length = 512)
    private String companyName;

    @Column(name = "company_status", length = 64)
    private String companyStatus;

    @Column(name = "company_type", length = 128)
    private String companyType;

    @Column(name = "incorporated_on")
    private LocalDate incorporatedOn;

    @Column(name = "score", nullable = false)
    private int score;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 16)
    private RiskLevel riskLevel;

    @Column(name = "verdict", nullable = false, columnDefinition = "text")
    private String verdict;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_reasons_json", nullable = false, columnDefinition = "jsonb")
    private String topReasonsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "flags_json", nullable = false, columnDefinition = "jsonb")
    private String flagsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommended_actions_json", nullable = false, columnDefinition = "jsonb")
    private String recommendedActionsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "scoring_engine", nullable = false, length = 40)
    private ScoringEngineType scoringEngine;

    @Column(name = "scoring_model_version", nullable = false, length = 40)
    private String scoringModelVersion;

    @Column(name = "input_fingerprint", nullable = false, length = 64)
    private String inputFingerprint;

    @Column(name = "explanation_summary", columnDefinition = "text")
    private String explanationSummary;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "data_fetched_at", nullable = false)
    private Instant dataFetchedAt;

    @Column(name = "computed_at", nullable = false)
    private Instant computedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;

    public Long getId() { return id; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String v) { companyName = v; }
    public String getCompanyStatus() { return companyStatus; }
    public void setCompanyStatus(String v) { companyStatus = v; }
    public String getCompanyType() { return companyType; }
    public void setCompanyType(String v) { companyType = v; }
    public LocalDate getIncorporatedOn() { return incorporatedOn; }
    public void setIncorporatedOn(LocalDate v) { incorporatedOn = v; }
    public int getScore() { return score; }
    public void setScore(int v) { score = v; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel v) { riskLevel = v; }
    public String getVerdict() { return verdict; }
    public void setVerdict(String v) { verdict = v; }
    public String getTopReasonsJson() { return topReasonsJson; }
    public void setTopReasonsJson(String v) { topReasonsJson = v; }
    public String getFlagsJson() { return flagsJson; }
    public void setFlagsJson(String v) { flagsJson = v; }
    public String getRecommendedActionsJson() { return recommendedActionsJson; }
    public void setRecommendedActionsJson(String v) { recommendedActionsJson = v; }
    public ScoringEngineType getScoringEngine() { return scoringEngine; }
    public void setScoringEngine(ScoringEngineType v) { scoringEngine = v; }
    public String getScoringModelVersion() { return scoringModelVersion; }
    public void setScoringModelVersion(String v) { scoringModelVersion = v; }
    public String getInputFingerprint() { return inputFingerprint; }
    public void setInputFingerprint(String v) { inputFingerprint = v; }
    public String getExplanationSummary() { return explanationSummary; }
    public void setExplanationSummary(String v) { explanationSummary = v; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double v) { confidence = v; }
    public Instant getDataFetchedAt() { return dataFetchedAt; }
    public void setDataFetchedAt(Instant v) { dataFetchedAt = v; }
    public Instant getComputedAt() { return computedAt; }
    public void setComputedAt(Instant v) { computedAt = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
