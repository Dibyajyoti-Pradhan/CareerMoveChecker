package com.careermovechecker.waitlist;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "waitlist_signups", uniqueConstraints = @UniqueConstraint(name = "uq_waitlist_email", columnNames = "email"))
public class WaitlistSignup {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(length = 16)
    private String persona;

    @Column(length = 16)
    private String tier;

    @Column(length = 128)
    private String role;

    @Column(length = 512)
    private String referrer;

    @Column(name = "landing_path", length = 256)
    private String landingPath;

    @Column(name = "anonymous_session_id", length = 64)
    private String anonymousSessionId;

    @Column(name = "user_agent_hash", length = 128)
    private String userAgentHash;

    @Column(name = "ip_hash", length = 128)
    private String ipHash;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String v) { email = v; }
    public String getPersona() { return persona; }
    public void setPersona(String v) { persona = v; }
    public String getTier() { return tier; }
    public void setTier(String v) { tier = v; }
    public String getRole() { return role; }
    public void setRole(String v) { role = v; }
    public String getReferrer() { return referrer; }
    public void setReferrer(String v) { referrer = v; }
    public String getLandingPath() { return landingPath; }
    public void setLandingPath(String v) { landingPath = v; }
    public String getAnonymousSessionId() { return anonymousSessionId; }
    public void setAnonymousSessionId(String v) { anonymousSessionId = v; }
    public String getUserAgentHash() { return userAgentHash; }
    public void setUserAgentHash(String v) { userAgentHash = v; }
    public String getIpHash() { return ipHash; }
    public void setIpHash(String v) { ipHash = v; }
    public Instant getCreatedAt() { return createdAt; }
}
