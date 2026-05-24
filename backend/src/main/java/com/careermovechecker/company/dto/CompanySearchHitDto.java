package com.careermovechecker.company.dto;

import java.time.LocalDate;

public record CompanySearchHitDto(
        String companyNumber,
        String companyName,
        String companyStatus,
        String companyType,
        String addressSnippet,
        LocalDate incorporatedOn
) {}
