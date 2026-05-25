package com.careermovechecker.alerts;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "watch_list_state")
public class WatchListState {

    @Id
    @Column(name = "company_number", length = 16)
    private String companyNumber;

    @Column(name = "last_filing_txn_id", length = 128)
    private String lastFilingTxnId;

    @Column(name = "last_filing_date")
    private LocalDate lastFilingDate;

    @Column(name = "last_status", length = 64)
    private String lastStatus;

    @Column(name = "last_polled_at")
    private Instant lastPolledAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public String getCompanyNumber() { return companyNumber; }
    public void setCompanyNumber(String v) { companyNumber = v; }
    public String getLastFilingTxnId() { return lastFilingTxnId; }
    public void setLastFilingTxnId(String v) { lastFilingTxnId = v; }
    public LocalDate getLastFilingDate() { return lastFilingDate; }
    public void setLastFilingDate(LocalDate v) { lastFilingDate = v; }
    public String getLastStatus() { return lastStatus; }
    public void setLastStatus(String v) { lastStatus = v; }
    public Instant getLastPolledAt() { return lastPolledAt; }
    public void setLastPolledAt(Instant v) { lastPolledAt = v; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant v) { updatedAt = v; }
}
