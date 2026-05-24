package com.careermovechecker.companieshouse;

import com.careermovechecker.company.dto.CompanyData;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Component
public class CompaniesHouseMapper {

    public CompanyData buildCompanyData(String companyNumber,
                                        JsonNode profile,
                                        JsonNode officers,
                                        JsonNode psc,
                                        JsonNode charges,
                                        JsonNode filings,
                                        JsonNode insolvency) {
        if (profile == null) return null;

        String name = text(profile, "company_name");
        String status = text(profile, "company_status");
        String type = text(profile, "type");
        LocalDate incorp = date(profile, "date_of_creation");
        Boolean accountsOverdue = bool(profile.path("accounts").path("overdue"));
        Boolean confOverdue = bool(profile.path("confirmation_statement").path("overdue"));
        LocalDate nextAccountsDue = date(profile.path("accounts").path("next_due"), null);
        LocalDate lastAccountsMadeUpTo = date(profile.path("accounts").path("last_accounts").path("made_up_to"), null);
        List<String> sic = arrayText(profile.path("sic_codes"));

        CompanyData.Address addr = parseAddress(profile.path("registered_office_address"));
        List<CompanyData.Officer> officerList = parseOfficers(officers);
        List<CompanyData.PscEntry> pscList = parsePsc(psc);
        List<CompanyData.Charge> chargeList = parseCharges(charges);
        List<CompanyData.FilingEntry> filingList = parseFilings(filings);
        List<CompanyData.InsolvencyCase> insolvencyList = parseInsolvency(insolvency);

        return new CompanyData(
                companyNumber, name, status, type, incorp, addr,
                accountsOverdue, confOverdue, nextAccountsDue, lastAccountsMadeUpTo,
                sic, officerList, pscList, chargeList, filingList, insolvencyList
        );
    }

    private CompanyData.Address parseAddress(JsonNode n) {
        if (n == null || n.isMissingNode() || n.isNull()) return null;
        return new CompanyData.Address(
                text(n, "address_line_1"),
                text(n, "address_line_2"),
                text(n, "locality"),
                text(n, "region"),
                text(n, "postal_code"),
                text(n, "country")
        );
    }

    private List<CompanyData.Officer> parseOfficers(JsonNode n) {
        List<CompanyData.Officer> out = new ArrayList<>();
        if (n == null || n.path("items").isMissingNode()) return out;
        for (JsonNode item : n.path("items")) {
            out.add(new CompanyData.Officer(
                    text(item, "name"),
                    text(item, "officer_role"),
                    date(item, "appointed_on"),
                    date(item, "resigned_on"),
                    text(item, "nationality"),
                    text(item, "occupation")
            ));
        }
        return out;
    }

    private List<CompanyData.PscEntry> parsePsc(JsonNode n) {
        List<CompanyData.PscEntry> out = new ArrayList<>();
        if (n == null || n.path("items").isMissingNode()) return out;
        for (JsonNode item : n.path("items")) {
            out.add(new CompanyData.PscEntry(
                    text(item, "name"),
                    text(item, "kind"),
                    arrayText(item.path("natures_of_control")),
                    date(item, "notified_on"),
                    date(item, "ceased_on")
            ));
        }
        return out;
    }

    private List<CompanyData.Charge> parseCharges(JsonNode n) {
        List<CompanyData.Charge> out = new ArrayList<>();
        if (n == null || n.path("items").isMissingNode()) return out;
        for (JsonNode item : n.path("items")) {
            out.add(new CompanyData.Charge(
                    text(item, "id"),
                    text(item, "status"),
                    date(item, "created_on"),
                    date(item, "delivered_on"),
                    text(item, "particulars"),
                    arrayTextFromPersons(item.path("persons_entitled"))
            ));
        }
        return out;
    }

    private List<CompanyData.FilingEntry> parseFilings(JsonNode n) {
        List<CompanyData.FilingEntry> out = new ArrayList<>();
        if (n == null || n.path("items").isMissingNode()) return out;
        for (JsonNode item : n.path("items")) {
            out.add(new CompanyData.FilingEntry(
                    text(item, "transaction_id"),
                    date(item, "date"),
                    text(item, "type"),
                    text(item, "description"),
                    text(item, "category")
            ));
        }
        return out;
    }

    private List<CompanyData.InsolvencyCase> parseInsolvency(JsonNode n) {
        List<CompanyData.InsolvencyCase> out = new ArrayList<>();
        if (n == null || n.path("cases").isMissingNode()) return out;
        for (JsonNode item : n.path("cases")) {
            out.add(new CompanyData.InsolvencyCase(
                    text(item, "number"),
                    text(item, "type"),
                    text(item, "status"),
                    findInsolvencyStart(item)
            ));
        }
        return out;
    }

    private LocalDate findInsolvencyStart(JsonNode caseNode) {
        for (JsonNode d : caseNode.path("dates")) {
            LocalDate dt = date(d, "date");
            if (dt != null) return dt;
        }
        return null;
    }

    private static String text(JsonNode n, String field) {
        if (n == null) return null;
        JsonNode v = n.get(field);
        if (v == null || v.isNull()) return null;
        return v.asText();
    }

    private static List<String> arrayText(JsonNode arr) {
        List<String> out = new ArrayList<>();
        if (arr == null || !arr.isArray()) return out;
        for (JsonNode v : arr) out.add(v.asText());
        return out;
    }

    private static List<String> arrayTextFromPersons(JsonNode arr) {
        List<String> out = new ArrayList<>();
        if (arr == null || !arr.isArray()) return out;
        Iterator<JsonNode> it = arr.elements();
        while (it.hasNext()) {
            JsonNode p = it.next();
            String name = text(p, "name");
            if (name != null) out.add(name);
        }
        return out;
    }

    private static Boolean bool(JsonNode v) {
        if (v == null || v.isNull() || v.isMissingNode()) return null;
        return v.asBoolean();
    }

    private static LocalDate date(JsonNode n, String field) {
        return date(n == null ? null : n.get(field), null);
    }

    private static LocalDate date(JsonNode v, Object _ignored) {
        if (v == null || v.isNull() || v.isMissingNode()) return null;
        try {
            return LocalDate.parse(v.asText());
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
