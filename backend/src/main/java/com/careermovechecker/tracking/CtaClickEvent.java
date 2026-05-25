package com.careermovechecker.tracking;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "cta_click_events")
public class CtaClickEvent {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cta_id", nullable = false, length = 64)
    private String ctaId;

    @Column(length = 256)
    private String path;

    @Column(length = 16)
    private String persona;

    @Column(name = "anonymous_session_id", length = 64)
    private String anonymousSessionId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private String metadataJson;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getCtaId() { return ctaId; }
    public void setCtaId(String v) { ctaId = v; }
    public String getPath() { return path; }
    public void setPath(String v) { path = v; }
    public String getPersona() { return persona; }
    public void setPersona(String v) { persona = v; }
    public String getAnonymousSessionId() { return anonymousSessionId; }
    public void setAnonymousSessionId(String v) { anonymousSessionId = v; }
    public String getMetadataJson() { return metadataJson; }
    public void setMetadataJson(String v) { metadataJson = v; }
    public Instant getCreatedAt() { return createdAt; }
}
