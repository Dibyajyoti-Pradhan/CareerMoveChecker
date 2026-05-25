package com.careermovechecker.alerts;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "watch_list_alerts")
public class WatchListAlert {

    public enum Severity { BAD, WARN, OK, INFO }

    public enum AlertType {
        STATUS_CHANGE, INSOLVENCY_OPENED, OFFICER_APPOINTED, OFFICER_RESIGNED,
        ACCOUNTS_OVERDUE, ACCOUNTS_FILED, NEW_CHARGE, FILING, DISQUALIFICATION_MATCH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_number", nullable = false, length = 16)
    private String companyNumber;

    @Column(name = "company_name", nullable = false, length = 512)
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 40)
    private AlertType alertType;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "means_candidate", columnDefinition = "text")
    private String meansCandidate;

    @Column(name = "means_freelancer", columnDefinition = "text")
    private String meansFreelancer;

    @Column(name = "means_agency", columnDefinition = "text")
    private String meansAgency;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence_json", columnDefinition = "jsonb")
    private String evidenceJson;

    @Column(nullable = false)
    private boolean unread = true;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String v) { companyName = v; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity v) { severity = v; }
    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType v) { alertType = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }
    public String getMeansCandidate() { return meansCandidate; }
    public void setMeansCandidate(String v) { meansCandidate = v; }
    public String getMeansFreelancer() { return meansFreelancer; }
    public void setMeansFreelancer(String v) { meansFreelancer = v; }
    public String getMeansAgency() { return meansAgency; }
    public void setMeansAgency(String v) { meansAgency = v; }
    public String getEvidenceJson() { return evidenceJson; }
    public void setEvidenceJson(String v) { evidenceJson = v; }
    public boolean isUnread() { return unread; }
    public void setUnread(boolean v) { unread = v; }
    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant v) { occurredAt = v; }
    public Instant getCreatedAt() { return createdAt; }
}
