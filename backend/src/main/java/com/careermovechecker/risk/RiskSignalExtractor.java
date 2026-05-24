package com.careermovechecker.risk;

import com.careermovechecker.company.dto.CompanyData;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class RiskSignalExtractor {

    public List<RiskSignal> extract(CompanyData c) {
        List<RiskSignal> signals = new ArrayList<>();
        if (c == null) return signals;

        String status = c.companyStatus() == null ? "" : c.companyStatus().toLowerCase();

        if ("dissolved".equals(status)) {
            signals.add(new RiskSignal("status.dissolved", "Company is dissolved", Map.of("status", status)));
        }
        if (status.contains("liquidation") || status.contains("receivership") || status.contains("administration")) {
            signals.add(new RiskSignal("status.windup", "Company in wind-up process", Map.of("status", status)));
        }

        if (c.insolvency() != null && !c.insolvency().isEmpty()) {
            signals.add(new RiskSignal("insolvency.present", "Insolvency records present", Map.of("count", c.insolvency().size())));
        }

        if (c.incorporatedOn() != null) {
            int monthsOld = Period.between(c.incorporatedOn(), LocalDate.now()).getYears() * 12
                    + Period.between(c.incorporatedOn(), LocalDate.now()).getMonths();
            if (monthsOld < 6) {
                signals.add(new RiskSignal("age.under6m", "Incorporated under 6 months ago", Map.of("monthsOld", monthsOld)));
            } else if (monthsOld < 24) {
                signals.add(new RiskSignal("age.under2y", "Incorporated under 2 years ago", Map.of("monthsOld", monthsOld)));
            } else if (monthsOld >= 60) {
                signals.add(new RiskSignal("age.over5y", "Active and incorporated over 5 years ago", Map.of("monthsOld", monthsOld)));
            }
        }

        if (Boolean.TRUE.equals(c.accountsOverdue())) {
            signals.add(new RiskSignal("filings.accountsOverdue", "Accounts overdue", Map.of()));
        }
        if (Boolean.TRUE.equals(c.confirmationStatementOverdue())) {
            signals.add(new RiskSignal("filings.confirmationOverdue", "Confirmation statement overdue", Map.of()));
        }
        if (Boolean.FALSE.equals(c.accountsOverdue()) && Boolean.FALSE.equals(c.confirmationStatementOverdue())) {
            signals.add(new RiskSignal("filings.current", "Filings appear current", Map.of()));
        }

        if (c.officers() != null) {
            long activeOfficers = c.officers().stream().filter(o -> o.resignedOn() == null).count();
            long recentResigns = c.officers().stream()
                    .filter(o -> o.resignedOn() != null && o.resignedOn().isAfter(LocalDate.now().minusYears(2)))
                    .count();
            if (activeOfficers == 0) {
                signals.add(new RiskSignal("officers.noneActive", "No active officers visible", Map.of()));
            }
            if (recentResigns >= 3) {
                signals.add(new RiskSignal("officers.churn", "High officer churn in last 24 months", Map.of("recentResignations", recentResigns)));
            }
        }

        if (c.psc() == null || c.psc().isEmpty()) {
            signals.add(new RiskSignal("psc.missing", "PSC data appears missing or unclear", Map.of()));
        } else if (c.psc().size() == 1) {
            signals.add(new RiskSignal("psc.simple", "Ownership appears straightforward", Map.of()));
        }

        if (c.charges() != null) {
            long outstanding = c.charges().stream().filter(ch -> "outstanding".equalsIgnoreCase(ch.status())).count();
            if (outstanding > 0) {
                signals.add(new RiskSignal("charges.outstanding", "Outstanding charges present", Map.of("count", outstanding)));
            }
        }

        if (c.filings() != null) {
            boolean strikeOff = c.filings().stream()
                    .anyMatch(f -> f.type() != null && (f.type().toUpperCase().startsWith("GAZ") || f.type().toUpperCase().contains("DS01")));
            if (strikeOff) {
                signals.add(new RiskSignal("filings.strikeOff", "Strike-off-related filing present", Map.of()));
            }
            boolean insolvencyFiling = c.filings().stream()
                    .anyMatch(f -> f.category() != null && f.category().toLowerCase().contains("insolvency"));
            if (insolvencyFiling) {
                signals.add(new RiskSignal("filings.insolvency", "Insolvency-related filing present", Map.of()));
            }
        }

        return signals;
    }
}
