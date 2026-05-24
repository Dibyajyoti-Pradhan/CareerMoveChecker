package com.careermovechecker.analytics;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "feedback_events")
public class FeedbackEvent {

    public enum UseCase {
        JOINING_AS_EMPLOYEE, FREELANCE_CLIENT_WORK, SUPPLIER_CHECK,
        LANDLORD_TENANT_CHECK, INVESTMENT_RESEARCH, OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_number", nullable = false, length = 16)
    private String companyNumber;

    @Column(nullable = false)
    private short rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "use_case", nullable = false, length = 64)
    private UseCase useCase;

    @Column(columnDefinition = "text")
    private String comment;

    @Column(name = "anonymous_session_id", length = 64)
    private String anonymousSessionId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public short getRating() { return rating; }
    public void setRating(short v) { rating = v; }
    public UseCase getUseCase() { return useCase; }
    public void setUseCase(UseCase v) { useCase = v; }
    public String getComment() { return comment; }
    public void setComment(String v) { comment = v; }
    public String getAnonymousSessionId() { return anonymousSessionId; }
    public void setAnonymousSessionId(String v) { anonymousSessionId = v; }
    public Instant getCreatedAt() { return createdAt; }
}
