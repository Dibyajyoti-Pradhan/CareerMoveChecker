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

    /**
     * Fuzzy match. CH register names are often "MR JOHN ANDREW SMITH" or
     * "SMITH, John" while officer names are "John Smith". Match strategy:
     * (1) tokenise both names, strip honorifics + commas
     * (2) require last name match (longest token, usually surname)
     * (3) require first-initial match (first char of first non-surname token)
     * Anything stricter would miss real hits; anything looser brings false positives.
     */
    private boolean nameMatches(String officerName, String hitName) {
        if (officerName == null || hitName == null) return false;
        java.util.List<String> a = tokens(officerName);
        java.util.List<String> b = tokens(hitName);
        if (a.isEmpty() || b.isEmpty()) return false;

        String surnameA = surname(a);
        String surnameB = surname(b);
        if (surnameA == null || !surnameA.equals(surnameB)) return false;

        String firstInitA = firstInitial(a, surnameA);
        String firstInitB = firstInitial(b, surnameB);
        if (firstInitA == null || firstInitB == null) return true; // surname-only match still counts
        return firstInitA.equals(firstInitB);
    }

    private static final java.util.Set<String> HONORIFICS = java.util.Set.of(
            "mr", "mrs", "ms", "miss", "dr", "prof", "sir", "lord", "lady", "rt", "hon", "the", "mx"
    );

    private java.util.List<String> tokens(String s) {
        return java.util.Arrays.stream(s.toLowerCase().replaceAll("[^a-z, ]", "").split("[,\\s]+"))
                .filter(t -> !t.isBlank())
                .filter(t -> !HONORIFICS.contains(t))
                .toList();
    }

    private String surname(java.util.List<String> tokens) {
        // CH often formats "SMITH, John" — comma-position implies surname-first
        // After tokenising we lose comma; assume surname is the longest token >= 2 chars
        return tokens.stream()
                .filter(t -> t.length() >= 2)
                .max(java.util.Comparator.comparingInt(String::length))
                .orElse(null);
    }

    private String firstInitial(java.util.List<String> tokens, String surname) {
        return tokens.stream()
                .filter(t -> !t.equals(surname))
                .findFirst()
                .map(t -> t.substring(0, 1))
                .orElse(null);
    }

    private LocalDate parseDate(JsonNode v) {
        if (v == null || v.isNull() || v.isMissingNode()) return null;
        try { return LocalDate.parse(v.asText()); } catch (Exception e) { return null; }
    }
}
