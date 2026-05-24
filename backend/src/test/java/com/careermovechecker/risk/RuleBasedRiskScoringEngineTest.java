package com.careermovechecker.risk;

import com.careermovechecker.company.dto.CompanyData;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RuleBasedRiskScoringEngineTest {

    private final RuleBasedRiskScoringEngine engine = new RuleBasedRiskScoringEngine();
    private final RiskSignalExtractor extractor = new RiskSignalExtractor();

    private RiskAssessment assess(CompanyData c) {
        var ctx = new RiskScoringContext(c, extractor.extract(c), List.of(), Instant.now());
        return engine.assess(ctx);
    }

    @Test
    void cleanOldActiveCompanyScoresHigh() {
        CompanyData c = new CompanyData(
                "12345678", "ESTABLISHED LTD", "active", "ltd",
                LocalDate.now().minusYears(10), null, false, false, null, null,
                List.of(), List.of(officer("Jane Doe", null)),
                List.of(psc()), List.of(), List.of(), List.of()
        );
        var r = assess(c);
        assertThat(r.score()).isGreaterThanOrEqualTo(80);
        assertThat(r.riskLevel()).isEqualTo(RiskLevel.LOW);
    }

    @Test
    void newCompanyUnderSixMonthsModerateCaution() {
        CompanyData c = new CompanyData(
                "13571112", "NEWCO LTD", "active", "ltd",
                LocalDate.now().minusMonths(2), null, false, false, null, null,
                List.of(), List.of(officer("Founder", null)),
                List.of(psc()), List.of(), List.of(), List.of()
        );
        var r = assess(c);
        assertThat(r.score()).isLessThan(80);
        assertThat(r.score()).isGreaterThanOrEqualTo(40);
    }

    @Test
    void dissolvedCompanyIsCritical() {
        CompanyData c = new CompanyData(
                "00000001", "GONE LTD", "dissolved", "ltd",
                LocalDate.now().minusYears(5), null, false, false, null, null,
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of()
        );
        var r = assess(c);
        assertThat(r.riskLevel()).isEqualTo(RiskLevel.CRITICAL);
        assertThat(r.flags()).anyMatch(f -> "dissolved".equals(f.id()));
    }

    @Test
    void insolvencyRecordsForceCritical() {
        CompanyData c = new CompanyData(
                "00000002", "BUST LTD", "liquidation", "ltd",
                LocalDate.now().minusYears(7), null, false, false, null, null,
                List.of(), List.of(), List.of(),
                List.of(),
                List.of(),
                List.of(new CompanyData.InsolvencyCase("INS-1", "Administration", "in-progress", LocalDate.now().minusYears(1)))
        );
        var r = assess(c);
        assertThat(r.riskLevel()).isEqualTo(RiskLevel.CRITICAL);
    }

    @Test
    void accountsOverdueRaisesWarning() {
        CompanyData c = new CompanyData(
                "00000003", "LATE LTD", "active", "ltd",
                LocalDate.now().minusYears(8), null, true, false, null, null,
                List.of(), List.of(officer("Director A", null)),
                List.of(psc()), List.of(), List.of(), List.of()
        );
        var r = assess(c);
        assertThat(r.flags()).anyMatch(f -> "accountsOverdue".equals(f.id()));
        assertThat(r.score()).isLessThan(80);
    }

    @Test
    void highOfficerChurnFlagsWarning() {
        CompanyData c = new CompanyData(
                "00000004", "CHURN LTD", "active", "ltd",
                LocalDate.now().minusYears(6), null, false, false, null, null,
                List.of(),
                List.of(
                        officer("A", LocalDate.now().minusMonths(3)),
                        officer("B", LocalDate.now().minusMonths(6)),
                        officer("C", LocalDate.now().minusMonths(12)),
                        officer("D", null)
                ),
                List.of(psc()), List.of(), List.of(), List.of()
        );
        var r = assess(c);
        assertThat(r.flags()).anyMatch(f -> "churn".equals(f.id()));
    }

    @Test
    void outstandingChargesOnlyAreMildOrModerate() {
        CompanyData c = new CompanyData(
                "00000005", "BANKED LTD", "active", "ltd",
                LocalDate.now().minusYears(10), null, false, false, null, null,
                List.of(), List.of(officer("CFO", null)),
                List.of(psc()),
                List.of(new CompanyData.Charge("c1", "outstanding", LocalDate.now().minusYears(2), null, "Fixed charge", List.of("Bank"))),
                List.of(), List.of()
        );
        var r = assess(c);
        assertThat(r.riskLevel()).isNotEqualTo(RiskLevel.CRITICAL);
    }

    @Test
    void missingPscRaisesManualReviewWarning() {
        CompanyData c = new CompanyData(
                "00000006", "OPAQUE LTD", "active", "ltd",
                LocalDate.now().minusYears(4), null, false, false, null, null,
                List.of(), List.of(officer("Sole", null)),
                List.of(), List.of(), List.of(), List.of()
        );
        var r = assess(c);
        assertThat(r.flags()).anyMatch(f -> "pscMissing".equals(f.id()));
    }

    private CompanyData.Officer officer(String name, LocalDate resigned) {
        return new CompanyData.Officer(name, "director", LocalDate.now().minusYears(2), resigned, "British", "director");
    }

    private CompanyData.PscEntry psc() {
        return new CompanyData.PscEntry("Owner", "individual-person-with-significant-control",
                List.of("ownership-of-shares-75-to-100-percent"), LocalDate.now().minusYears(2), null);
    }
}
