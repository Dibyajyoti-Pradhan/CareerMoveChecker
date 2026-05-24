package com.careermovechecker.company;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "company_raw_snapshots")
public class CompanyRawSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_number", nullable = false, length = 16)
    private String companyNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 40)
    private SourceType sourceType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_json", nullable = false, columnDefinition = "jsonb")
    private String rawJson;

    @Column(name = "fetched_at", nullable = false)
    private Instant fetchedAt;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    public enum SourceType {
        PROFILE, REGISTERED_OFFICE, OFFICERS, PSC, CHARGES, FILING_HISTORY, INSOLVENCY
    }

    public Long getId() { return id; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { this.companyNumber = v; }
    public SourceType getSourceType() { return sourceType; }
    public void setSourceType(SourceType v) { this.sourceType = v; }
    public String getRawJson() { return rawJson; }
    public void setRawJson(String v) { this.rawJson = v; }
    public Instant getFetchedAt() { return fetchedAt; }
    public void setFetchedAt(Instant v) { this.fetchedAt = v; }
    public Instant getCreatedAt() { return createdAt; }
}
