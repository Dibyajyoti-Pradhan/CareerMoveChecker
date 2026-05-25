package com.careermovechecker.companieshouse;

import com.careermovechecker.company.dto.CompanyData;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * For each active officer of the company, fetch their other appointments and count
 * dissolved / liquidation / administration companies — the "has this director killed
 * companies before?" signal.
 */
@Service
public class DirectorTrackRecordService {

    private static final Logger log = LoggerFactory.getLogger(DirectorTrackRecordService.class);
    private static final int MAX_OFFICERS_TO_CHECK = 6;
    private static final Set<String> WIND_UP_STATUSES = Set.of(
            "dissolved", "liquidation", "in liquidation", "voluntary-arrangement",
            "administration", "receivership", "receiver-action"
    );

    private final CompaniesHouseClient ch;

    public DirectorTrackRecordService(CompaniesHouseClient ch) {
        this.ch = ch;
    }

    public record TrackRecord(int officersChecked, int totalOtherAppointments, int failedCompanies, List<Failure> failures) {}

    public record Failure(String officerName, String otherCompanyName, String otherCompanyNumber, String status) {}

    public TrackRecord check(CompanyData company) {
        if (company == null || company.officers() == null) return new TrackRecord(0, 0, 0, List.of());
        List<Failure> failures = new ArrayList<>();
        int totalOther = 0;
        int checked = 0;

        // Most active recent officers — limit calls to keep request budget sane
        var active = company.officers().stream()
                .filter(o -> o.resignedOn() == null && o.officerId() != null)
                .limit(MAX_OFFICERS_TO_CHECK)
                .toList();

        for (var officer : active) {
            try {
                var result = ch.officerAppointments(officer.officerId());
                if (result.isEmpty()) continue;
                checked++;
                JsonNode items = result.get().path("items");
                if (!items.isArray()) continue;
                for (JsonNode appt : items) {
                    String apptCompanyNumber = appt.path("appointed_to").path("company_number").asText(null);
                    if (apptCompanyNumber == null) continue;
                    if (apptCompanyNumber.equals(company.companyNumber())) continue;
                    totalOther++;
                    String status = appt.path("appointed_to").path("company_status").asText(null);
                    if (status != null && WIND_UP_STATUSES.contains(status.toLowerCase())) {
                        failures.add(new Failure(
                                officer.name(),
                                appt.path("appointed_to").path("company_name").asText(null),
                                apptCompanyNumber,
                                status
                        ));
                    }
                }
            } catch (Exception e) {
                log.warn("Officer-appointments fetch failed for {}", officer.officerId(), e);
            }
        }

        return new TrackRecord(checked, totalOther, failures.size(), failures);
    }
}
