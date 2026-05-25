package com.careermovechecker.company.dto;

import com.careermovechecker.company.CompanyRiskReport;
import com.careermovechecker.companieshouse.DirectorTrackRecordService;
import com.careermovechecker.companieshouse.DisqualificationService;
import com.careermovechecker.risk.RecommendedAction;
import com.careermovechecker.risk.RiskFlag;
import com.careermovechecker.risk.RiskLevel;
import com.careermovechecker.risk.ScoringEngineType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;

public record CompanyReportDto(
        Profile profile,
        Assessment assessment,
        List<CompanyData.Officer> officers,
        List<CompanyData.PscEntry> psc,
        List<CompanyData.Charge> charges,
        List<CompanyData.FilingEntry> filings,
        List<CompanyData.InsolvencyCase> insolvency,
        DisqualificationService.DisqualificationCheck disqualificationCheck,
        DirectorTrackRecordService.TrackRecord directorTrackRecord,
        Instant dataFetchedAt,
        Instant computedAt
) {
    public record Profile(
            String companyNumber, String companyName, String companyStatus, String companyType,
            java.time.LocalDate incorporatedOn, CompanyData.Address registeredOffice,
            Boolean accountsOverdue, Boolean confirmationStatementOverdue,
            java.time.LocalDate nextAccountsDue, java.time.LocalDate lastAccountsMadeUpTo,
            List<String> sicCodes
    ) {}

    public record Assessment(
            int score, RiskLevel riskLevel, String verdict,
            List<String> topReasons, List<RiskFlag> flags, List<RecommendedAction> recommendedActions,
            ScoringEngineType engineType, String modelVersion,
            String explanationSummary, double confidence
    ) {}

    public static CompanyReportDto fromEntity(CompanyRiskReport r, CompanyData data, ObjectMapper json) {
        return fromEntity(r, data, null, null, json);
    }

    public static CompanyReportDto fromEntity(CompanyRiskReport r, CompanyData data, DisqualificationService.DisqualificationCheck disq, ObjectMapper json) {
        return fromEntity(r, data, disq, null, json);
    }

    public static CompanyReportDto fromEntity(CompanyRiskReport r, CompanyData data, DisqualificationService.DisqualificationCheck disq, DirectorTrackRecordService.TrackRecord track, ObjectMapper json) {
        List<String> reasons = parse(json, r.getTopReasonsJson(), new TypeReference<>() {});
        List<RiskFlag> flags = parse(json, r.getFlagsJson(), new TypeReference<>() {});
        List<RecommendedAction> actions = parse(json, r.getRecommendedActionsJson(), new TypeReference<>() {});

        Profile profile = new Profile(
                r.getCompanyNumber(),
                r.getCompanyName(),
                r.getCompanyStatus(),
                r.getCompanyType(),
                r.getIncorporatedOn(),
                data == null ? null : data.registeredOffice(),
                data == null ? null : data.accountsOverdue(),
                data == null ? null : data.confirmationStatementOverdue(),
                data == null ? null : data.nextAccountsDue(),
                data == null ? null : data.lastAccountsMadeUpTo(),
                data == null ? List.of() : data.sicCodes()
        );

        Assessment assessment = new Assessment(
                r.getScore(), r.getRiskLevel(), r.getVerdict(),
                reasons, flags, actions,
                r.getScoringEngine(), r.getScoringModelVersion(),
                r.getExplanationSummary(),
                r.getConfidence() == null ? 0.0 : r.getConfidence()
        );

        return new CompanyReportDto(
                profile, assessment,
                data == null ? List.of() : data.officers(),
                data == null ? List.of() : data.psc(),
                data == null ? List.of() : data.charges(),
                data == null ? List.of() : data.filings(),
                data == null ? List.of() : data.insolvency(),
                disq,
                track,
                r.getDataFetchedAt(), r.getComputedAt()
        );
    }

    private static <T> T parse(ObjectMapper json, String value, TypeReference<T> ref) {
        if (value == null || value.isBlank()) {
            try { return json.readValue("[]", ref); } catch (Exception e) { return null; }
        }
        try {
            return json.readValue(value, ref);
        } catch (Exception e) {
            try { return json.readValue("[]", ref); } catch (Exception ex) { return null; }
        }
    }
}
