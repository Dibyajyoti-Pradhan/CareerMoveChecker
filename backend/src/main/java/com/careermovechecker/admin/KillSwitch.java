package com.careermovechecker.admin;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "kill_switches")
public class KillSwitch {

    @Id
    @Column(length = 64)
    private String key;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(columnDefinition = "text")
    private String reason;

    @Column(name = "updated_by", length = 64)
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public String getKey() { return key; }
    public void setKey(String v) { key = v; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean v) { enabled = v; }
    public String getReason() { return reason; }
    public void setReason(String v) { reason = v; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String v) { updatedBy = v; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant v) { updatedAt = v; }
}
