package com.careermovechecker.companieshouse;

import com.careermovechecker.company.dto.CompanyData;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DisqualificationService {

    private static final Logger log = LoggerFactory.getLogger(DisqualificationService.class);

    private final CompaniesHouseClient ch;

    public DisqualificationService(CompaniesHouseClient ch) {
        this.ch = ch;
    }

    public record DisqualificationCheck(String status, List<Match> matches) {
        public enum Status { CLEAR, MATCH, ERROR }
    }

    public record Match(String name, String reason, LocalDate disqualifiedFrom, LocalDate disqualifiedUntil) {}

    public DisqualificationCheck check(CompanyData company) {
        if (company == null || company.officers() == null || company.officers().isEmpty()) {
            return new DisqualificationCheck("CLEAR", List.of());
        }
        List<Match> matches = new ArrayList<>();
        for (var officer : company.officers()) {
            if (officer.resignedOn() != null) continue;
            if (officer.name() == null || officer.name().isBlank()) continue;
            try {
                var result = ch.searchDisqualifiedOfficers(officer.name());
                if (result.isEmpty()) continue;
                JsonNode items = result.get().path("items");
                if (!items.isArray()) continue;
                for (JsonNode item : items) {
                    String hitName = item.path("title").asText("");
                    if (!nameMatches(officer.name(), hitName)) continue;
                    matches.add(new Match(
                            hitName,
                            item.path("description").asText(null),
                            parseDate(item.path("date_of_birth")),
                            parseDate(item.path("disqualified_until"))
                    ));
                    break;
                }
            } catch (Exception e) {
                log.warn("Disqualified-officer check failed for {}", officer.name(), e);
            }
        }
        return new DisqualificationCheck(matches.isEmpty() ? "CLEAR" : "MATCH", matches);
    }

    private boolean nameMatches(String officerName, String hitName) {
        if (officerName == null || hitName == null) return false;
        String a = normalise(officerName);
        String b = normalise(hitName);
        return a.equals(b);
    }

    private String normalise(String s) {
        return s.toLowerCase()
                .replaceAll("[^a-z, ]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private LocalDate parseDate(JsonNode v) {
        if (v == null || v.isNull() || v.isMissingNode()) return null;
        try { return LocalDate.parse(v.asText()); } catch (Exception e) { return null; }
    }
}
