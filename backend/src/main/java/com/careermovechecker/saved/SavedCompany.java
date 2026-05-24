package com.careermovechecker.saved;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "saved_companies")
public class SavedCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_number", nullable = false, length = 16, unique = true)
    private String companyNumber;

    @Column(name = "company_name", nullable = false, length = 512)
    private String companyName;

    @Column(name = "note", columnDefinition = "text")
    private String note;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Long getId() { return id; }
    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String v) { companyName = v; }
    public String getNote() { return note; }
    public void setNote(String v) { note = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant v) { updatedAt = v; }
}
