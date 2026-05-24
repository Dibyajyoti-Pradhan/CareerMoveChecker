package com.careermovechecker.risk;

import com.careermovechecker.company.dto.CompanyData;

import java.time.Instant;
import java.util.List;

public record RiskScoringContext(
        CompanyData company,
        List<RiskSignal> signals,
        List<String> dataQualityWarnings,
        Instant dataFetchedAt
) {
}
