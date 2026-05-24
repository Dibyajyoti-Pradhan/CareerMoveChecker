package com.careermovechecker.company;

import com.careermovechecker.analytics.CompanyReportView;
import com.careermovechecker.analytics.CompanyReportViewRepository;
import com.careermovechecker.companieshouse.CompaniesHouseClient;
import com.careermovechecker.companieshouse.CompaniesHouseMapper;
import com.careermovechecker.company.dto.CompanyData;
import com.careermovechecker.company.dto.CompanyReportDto;
import com.careermovechecker.company.dto.CompanySearchHitDto;
import com.careermovechecker.risk.RiskScoringService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CompanyService {

    private static final Logger log = LoggerFactory.getLogger(CompanyService.class);

    private final CompaniesHouseClient ch;
    private final CompaniesHouseMapper mapper;
    private final CompanyRawSnapshotRepository snapshots;
    private final CompanyRiskReportRepository reports;
    private final CompanyReportViewRepository views;
    private final RiskScoringService scoring;
    private final ObjectMapper json;

    public CompanyService(CompaniesHouseClient ch,
                          CompaniesHouseMapper mapper,
                          CompanyRawSnapshotRepository snapshots,
                          CompanyRiskReportRepository reports,
                          CompanyReportViewRepository views,
                          RiskScoringService scoring,
                          ObjectMapper json) {
        this.ch = ch;
        this.mapper = mapper;
        this.snapshots = snapshots;
        this.reports = reports;
        this.views = views;
        this.scoring = scoring;
        this.json = json;
    }

    public List<CompanySearchHitDto> search(String query) {
        return ch.searchCompanies(query).map(this::toHits).orElseGet(List::of);
    }

    @Transactional
    public Optional<CompanyReportDto> getOrComputeReport(String companyNumber, boolean force, String source) {
        if (!force) {
            Optional<CompanyRiskReport> cached = reports.findByCompanyNumber(companyNumber);
            if (cached.isPresent() && isFresh(cached.get())) {
                logView(cached.get(), source);
                return Optional.of(toDto(cached.get()));
            }
        }
        return compute(companyNumber, source);
    }

    private Optional<CompanyReportDto> compute(String companyNumber, String source) {
        Optional<JsonNode> profile = ch.profile(companyNumber);
        if (profile.isEmpty()) return Optional.empty();

        JsonNode officers = ch.officers(companyNumber).orElse(null);
        JsonNode psc = ch.psc(companyNumber).orElse(null);
        JsonNode charges = ch.charges(companyNumber).orElse(null);
        JsonNode filings = ch.filingHistory(companyNumber).orElse(null);
        JsonNode insolvency = ch.insolvency(companyNumber).orElse(null);

        Instant fetchedAt = Instant.now();
        persistSnapshots(companyNumber, profile.orElse(null), officers, psc, charges, filings, insolvency, fetchedAt);

        CompanyData data = mapper.buildCompanyData(companyNumber, profile.get(), officers, psc, charges, filings, insolvency);
        if (data == null) return Optional.empty();

        var scored = scoring.score(data);
        var assessment = scored.assessment();
        Instant now = Instant.now();

        CompanyRiskReport entity = reports.findByCompanyNumber(companyNumber).orElseGet(CompanyRiskReport::new);
        entity.setCompanyNumber(companyNumber);
        entity.setCompanyName(data.companyName());
        entity.setCompanyStatus(data.companyStatus());
        entity.setCompanyType(data.companyType());
        entity.setIncorporatedOn(data.incorporatedOn());
        entity.setScore(assessment.score());
        entity.setRiskLevel(assessment.riskLevel());
        entity.setVerdict(assessment.verdict());
        entity.setTopReasonsJson(serialize(assessment.topReasons()));
        entity.setFlagsJson(serialize(assessment.flags()));
        entity.setRecommendedActionsJson(serialize(assessment.recommendedActions()));
        entity.setScoringEngine(assessment.engineType());
        entity.setScoringModelVersion(assessment.modelVersion());
        entity.setInputFingerprint(scored.inputFingerprint());
        entity.setExplanationSummary(assessment.explanationSummary());
        entity.setConfidence(assessment.confidence());
        entity.setDataFetchedAt(fetchedAt);
        entity.setComputedAt(now);
        reports.save(entity);

        logView(entity, source);
        return Optional.of(toDto(entity, data));
    }

    private boolean isFresh(CompanyRiskReport r) {
        return r.getDataFetchedAt().isAfter(Instant.now().minus(Duration.ofHours(12)));
    }

    private void persistSnapshots(String companyNumber, JsonNode profile, JsonNode officers, JsonNode psc,
                                  JsonNode charges, JsonNode filings, JsonNode insolvency, Instant fetchedAt) {
        save(companyNumber, CompanyRawSnapshot.SourceType.PROFILE, profile, fetchedAt);
        save(companyNumber, CompanyRawSnapshot.SourceType.OFFICERS, officers, fetchedAt);
        save(companyNumber, CompanyRawSnapshot.SourceType.PSC, psc, fetchedAt);
        save(companyNumber, CompanyRawSnapshot.SourceType.CHARGES, charges, fetchedAt);
        save(companyNumber, CompanyRawSnapshot.SourceType.FILING_HISTORY, filings, fetchedAt);
        save(companyNumber, CompanyRawSnapshot.SourceType.INSOLVENCY, insolvency, fetchedAt);
    }

    private void save(String companyNumber, CompanyRawSnapshot.SourceType type, JsonNode body, Instant fetchedAt) {
        if (body == null) return;
        try {
            CompanyRawSnapshot row = new CompanyRawSnapshot();
            row.setCompanyNumber(companyNumber);
            row.setSourceType(type);
            row.setRawJson(json.writeValueAsString(body));
            row.setFetchedAt(fetchedAt);
            snapshots.save(row);
        } catch (JsonProcessingException e) {
            log.warn("Could not serialize snapshot for {} {}", companyNumber, type, e);
        }
    }

    private void logView(CompanyRiskReport report, String source) {
        try {
            CompanyReportView v = new CompanyReportView();
            v.setCompanyNumber(report.getCompanyNumber());
            v.setCompanyName(report.getCompanyName());
            v.setRiskScore(report.getScore());
            v.setRiskLevel(report.getRiskLevel());
            v.setSource(source);
            views.save(v);
        } catch (Exception ignored) {
            // analytics best-effort
        }
    }

    private String serialize(Object o) {
        try {
            return json.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<CompanySearchHitDto> toHits(JsonNode root) {
        List<CompanySearchHitDto> out = new ArrayList<>();
        if (root == null || root.path("items").isMissingNode()) return out;
        for (JsonNode item : root.path("items")) {
            out.add(new CompanySearchHitDto(
                    item.path("company_number").asText(null),
                    item.path("title").asText(null),
                    item.path("company_status").asText(null),
                    item.path("company_type").asText(null),
                    item.path("address_snippet").asText(null),
                    parseDate(item.path("date_of_creation").asText(null))
            ));
        }
        return out;
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); } catch (Exception e) { return null; }
    }

    private CompanyReportDto toDto(CompanyRiskReport r) {
        return CompanyReportDto.fromEntity(r, null, json);
    }

    private CompanyReportDto toDto(CompanyRiskReport r, CompanyData data) {
        return CompanyReportDto.fromEntity(r, data, json);
    }
}
