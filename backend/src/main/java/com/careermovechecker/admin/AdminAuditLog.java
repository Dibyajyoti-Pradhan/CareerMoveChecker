package com.careermovechecker.admin;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "admin_audit_log")
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String actor;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(name = "target_type", length = 64)
    private String targetType;

    @Column(name = "target_id", length = 128)
    private String targetId;

    @Column(columnDefinition = "text")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "detail_json", columnDefinition = "jsonb")
    private String detailJson;

    @Column(name = "ip_hash", length = 128)
    private String ipHash;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public String getActor() { return actor; }
    public void setActor(String v) { actor = v; }
    public String getAction() { return action; }
    public void setAction(String v) { action = v; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String v) { targetType = v; }
    public String getTargetId() { return targetId; }
    public void setTargetId(String v) { targetId = v; }
    public String getSummary() { return summary; }
    public void setSummary(String v) { summary = v; }
    public String getDetailJson() { return detailJson; }
    public void setDetailJson(String v) { detailJson = v; }
    public String getIpHash() { return ipHash; }
    public void setIpHash(String v) { ipHash = v; }
    public Instant getCreatedAt() { return createdAt; }
}
