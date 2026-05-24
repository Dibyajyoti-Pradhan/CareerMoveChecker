package com.careermovechecker.risk;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class RuleBasedRiskScoringEngine implements RiskScoringEngine {

    private static final int BASE = 75;
    private static final String VERSION = "rules-v1";

    @Override
    public ScoringEngineType engineType() {
        return ScoringEngineType.RULE_BASED;
    }

    @Override
    public String modelVersion() {
        return VERSION;
    }

    @Override
    public RiskAssessment assess(RiskScoringContext ctx) {
        Set<String> sigIds = new LinkedHashSet<>();
        ctx.signals().forEach(s -> sigIds.add(s.id()));

        int score = BASE;
        List<String> reasons = new ArrayList<>();
        List<RiskFlag> flags = new ArrayList<>();
        List<RecommendedAction> actions = new ArrayList<>();

        // Critical deductions
        if (sigIds.contains("status.dissolved")) {
            score -= 70;
            reasons.add("Company is dissolved");
            flags.add(new RiskFlag("dissolved", RiskFlag.Severity.CRITICAL, "Dissolved company",
                    "Companies House reports this company as dissolved. Engaging with a dissolved entity is high risk.",
                    "Status: dissolved",
                    "Do not commit. If exposure exists, seek legal advice."));
            actions.add(new RecommendedAction("legal", "Seek professional advice", "Speak to a solicitor about any existing exposure to a dissolved entity."));
        }
        if (sigIds.contains("status.windup")) {
            score -= 60;
            reasons.add("Company in wind-up process (liquidation/administration/receivership)");
            flags.add(new RiskFlag("windup", RiskFlag.Severity.CRITICAL, "Company in wind-up",
                    "The company appears to be in liquidation, administration, or receivership. New commitments carry serious visible risk.",
                    "Status indicates wind-up",
                    "Pause new commitments and consult the appointed officeholder."));
        }
        if (sigIds.contains("insolvency.present") || sigIds.contains("filings.insolvency")) {
            score -= 50;
            reasons.add("Insolvency records on file");
            flags.add(new RiskFlag("insolvency", RiskFlag.Severity.CRITICAL, "Insolvency records",
                    "One or more insolvency events are recorded against this company.",
                    "Insolvency records present",
                    "Read filed insolvency documents before proceeding."));
        }
        if (sigIds.contains("filings.strikeOff")) {
            score -= 30;
            reasons.add("Strike-off-related filing present");
            flags.add(new RiskFlag("strikeOff", RiskFlag.Severity.WARNING, "Strike-off filing",
                    "A strike-off-related filing is visible. The company may be moving toward dissolution.",
                    "Strike-off filing present",
                    "Check the latest filing history before relying on this entity."));
        }

        // Filings warnings
        if (sigIds.contains("filings.accountsOverdue")) {
            score -= 20;
            reasons.add("Accounts overdue");
            flags.add(new RiskFlag("accountsOverdue", RiskFlag.Severity.WARNING, "Accounts overdue",
                    "Annual accounts are past the filing deadline. Overdue accounts often correlate with operational difficulty.",
                    "Accounts overdue flag set",
                    "Treat operational claims with extra scrutiny."));
        }
        if (sigIds.contains("filings.confirmationOverdue")) {
            score -= 15;
            reasons.add("Confirmation statement overdue");
            flags.add(new RiskFlag("confirmationOverdue", RiskFlag.Severity.WARNING, "Confirmation statement overdue",
                    "The company has not filed its confirmation statement on time.",
                    "Confirmation statement overdue",
                    "Verify current officers and shareholders independently."));
        }

        // Age
        if (sigIds.contains("age.under6m")) {
            score -= 15;
            reasons.add("Incorporated under 6 months ago");
            flags.add(new RiskFlag("under6m", RiskFlag.Severity.WARNING, "Very newly incorporated",
                    "Company is under 6 months old. Limited public-data history available. Not necessarily negative.",
                    "Incorporated within last 6 months",
                    "Ask for trade references and proof of work."));
        } else if (sigIds.contains("age.under2y")) {
            score -= 10;
            reasons.add("Incorporated under 2 years ago");
            flags.add(new RiskFlag("under2y", RiskFlag.Severity.INFO, "Recently incorporated",
                    "Company is under 2 years old. Limited public-data history.",
                    "Incorporated within last 24 months",
                    "Verify trading activity independently."));
        }

        // Officers / PSC
        if (sigIds.contains("officers.noneActive")) {
            score -= 10;
            reasons.add("No active officers visible");
            flags.add(new RiskFlag("noOfficers", RiskFlag.Severity.WARNING, "No active officers",
                    "Companies House does not show any active officers.",
                    "0 active officers",
                    "Requires manual review."));
        }
        if (sigIds.contains("officers.churn")) {
            score -= 10;
            reasons.add("High officer churn in last 24 months");
            flags.add(new RiskFlag("churn", RiskFlag.Severity.WARNING, "High officer churn",
                    "Multiple officer resignations in the last 24 months may indicate instability.",
                    "Multiple recent resignations",
                    "Ask about leadership stability."));
        }
        if (sigIds.contains("psc.missing")) {
            score -= 10;
            reasons.add("PSC data appears missing or unclear");
            flags.add(new RiskFlag("pscMissing", RiskFlag.Severity.WARNING, "PSC data missing",
                    "No persons with significant control returned. Requires manual review.",
                    "Empty PSC list",
                    "Ask who controls the company beneficially."));
        }

        // Charges
        if (sigIds.contains("charges.outstanding")) {
            long count = ctx.signals().stream()
                    .filter(s -> "charges.outstanding".equals(s.id()))
                    .findFirst()
                    .map(s -> ((Number) s.evidence().getOrDefault("count", 1)).longValue())
                    .orElse(1L);
            int deduction = Math.min(15, (int) Math.max(5, count * 2));
            score -= deduction;
            reasons.add("Outstanding charges (" + count + ")");
            flags.add(new RiskFlag("charges", RiskFlag.Severity.INFO, "Outstanding charges",
                    "Outstanding charges are not necessarily negative — most active companies have some — but worth being aware of.",
                    count + " outstanding charge(s)",
                    "Consider in context with size and sector."));
        }

        // Positive adjustments
        if (sigIds.contains("age.over5y") && "active".equalsIgnoreCase(ctx.company().companyStatus())) {
            score += 10;
            reasons.add("Active for over 5 years");
            flags.add(new RiskFlag("longevity", RiskFlag.Severity.POSITIVE, "Long trading history",
                    "Longer trading history is a visible positive signal — not a guarantee of safety.",
                    "Active for 5+ years",
                    "None required."));
        }
        if (sigIds.contains("filings.current") && "active".equalsIgnoreCase(ctx.company().companyStatus())) {
            score += 5;
            reasons.add("Filings appear current");
            flags.add(new RiskFlag("filingsCurrent", RiskFlag.Severity.POSITIVE, "Filings up to date",
                    "Accounts and confirmation statement appear current at Companies House.",
                    "No overdue flags",
                    "None required."));
        }
        if (ctx.company().insolvency() != null && ctx.company().insolvency().isEmpty()
                && !sigIds.contains("status.dissolved") && !sigIds.contains("status.windup")) {
            score += 5;
            reasons.add("No insolvency records found");
        }
        if (sigIds.contains("psc.simple")) {
            score += 5;
            reasons.add("Ownership appears straightforward");
        }

        int clamped = Math.max(0, Math.min(100, score));
        RiskLevel level = RiskLevel.fromScore(clamped);

        if (actions.isEmpty()) {
            actions.add(new RecommendedAction("verify", "Verify identity",
                    "Confirm the company number and registered office match what your counterparty has shared."));
        }

        String verdict = buildVerdict(level, ctx.company());
        double confidence = computeConfidence(ctx);
        List<String> topReasons = reasons.stream().limit(3).toList();
        String summary = "Score derived from " + ctx.signals().size() + " public-data signals using rule engine " + VERSION + ".";

        return new RiskAssessment(
                clamped, level, verdict, topReasons, flags, actions,
                ScoringEngineType.RULE_BASED, VERSION, summary, confidence
        );
    }

    private String buildVerdict(RiskLevel level, com.careermovechecker.company.dto.CompanyData c) {
        return switch (level) {
            case LOW -> "Low visible risk based on public Companies House signals. Not a guarantee of trustworthiness — verify what matters for your decision.";
            case MODERATE -> "Some caution warranted. Public data shows mixed or limited signals. Additional checks recommended before significant commitment.";
            case HIGH -> "High caution. One or more meaningful warning signals visible. Verify carefully before proceeding.";
            case CRITICAL -> "Serious visible risk in public data — for example dissolved status, insolvency, or wind-up indicators. Verify before any new commitment. This is not a fraud determination, it is a public-data status.";
        };
    }

    private double computeConfidence(RiskScoringContext ctx) {
        int present = 0;
        var c = ctx.company();
        if (c.companyStatus() != null) present++;
        if (c.incorporatedOn() != null) present++;
        if (c.officers() != null && !c.officers().isEmpty()) present++;
        if (c.psc() != null && !c.psc().isEmpty()) present++;
        if (c.filings() != null && !c.filings().isEmpty()) present++;
        if (c.charges() != null) present++;
        if (c.insolvency() != null) present++;
        return Math.min(1.0, present / 7.0);
    }
}
