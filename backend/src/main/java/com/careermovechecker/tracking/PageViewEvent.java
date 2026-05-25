package com.careermovechecker.tracking;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "page_view_events")
public class PageViewEvent {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 256)
    private String path;

    @Column(length = 512)
    private String referrer;

    @Column(length = 16)
    private String persona;

    @Column(name = "anonymous_session_id", length = 64)
    private String anonymousSessionId;

    @Column(name = "user_agent_hash", length = 128)
    private String userAgentHash;

    @Column(name = "is_first_visit", nullable = false)
    private boolean firstVisit = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getPath() { return path; }
    public void setPath(String v) { path = v; }
    public String getReferrer() { return referrer; }
    public void setReferrer(String v) { referrer = v; }
    public String getPersona() { return persona; }
    public void setPersona(String v) { persona = v; }
    public String getAnonymousSessionId() { return anonymousSessionId; }
    public void setAnonymousSessionId(String v) { anonymousSessionId = v; }
    public String getUserAgentHash() { return userAgentHash; }
    public void setUserAgentHash(String v) { userAgentHash = v; }
    public boolean isFirstVisit() { return firstVisit; }
    public void setFirstVisit(boolean v) { firstVisit = v; }
    public Instant getCreatedAt() { return createdAt; }
}
