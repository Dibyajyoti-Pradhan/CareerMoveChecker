package com.careermovechecker.company.dto;

import java.time.LocalDate;
import java.util.List;

public record CompanyData(
        String companyNumber,
        String companyName,
        String companyStatus,
        String companyType,
        LocalDate incorporatedOn,
        Address registeredOffice,
        Boolean accountsOverdue,
        Boolean confirmationStatementOverdue,
        LocalDate nextAccountsDue,
        LocalDate lastAccountsMadeUpTo,
        List<String> sicCodes,
        List<Officer> officers,
        List<PscEntry> psc,
        List<Charge> charges,
        List<FilingEntry> filings,
        List<InsolvencyCase> insolvency
) {
    public record Address(String line1, String line2, String locality, String region, String postalCode, String country) {}
    public record Officer(String name, String role, LocalDate appointedOn, LocalDate resignedOn, String nationality, String occupation, String officerId) {}
    public record PscEntry(String name, String kind, List<String> natureOfControl, LocalDate notifiedOn, LocalDate ceasedOn) {}
    public record Charge(String id, String status, LocalDate createdOn, LocalDate deliveredOn, String description, List<String> personsEntitled) {}
    public record FilingEntry(String id, LocalDate date, String type, String description, String category) {}
    public record InsolvencyCase(String caseNumber, String type, String status, LocalDate startedOn) {}
}
