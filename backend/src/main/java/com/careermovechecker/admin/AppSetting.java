package com.careermovechecker.admin;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "app_settings")
public class AppSetting {

    public enum ValueType { STRING, LONG, DOUBLE, BOOLEAN }

    @Id
    @Column(length = 128)
    private String key;

    @Column(nullable = false, columnDefinition = "text")
    private String value;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", nullable = false, length = 16)
    private ValueType valueType;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "updated_by", length = 64)
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public String getKey() { return key; }
    public void setKey(String v) { key = v; }
    public String getValue() { return value; }
    public void setValue(String v) { value = v; }
    public ValueType getValueType() { return valueType; }
    public void setValueType(ValueType v) { valueType = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String v) { updatedBy = v; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant v) { updatedAt = v; }
}
