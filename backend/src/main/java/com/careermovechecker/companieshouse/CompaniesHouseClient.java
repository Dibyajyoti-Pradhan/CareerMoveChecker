package com.careermovechecker.companieshouse;

import com.careermovechecker.admin.AlertService;
import com.careermovechecker.admin.DownstreamAlert;
import com.careermovechecker.observability.ExternalApiCallLog;
import com.careermovechecker.observability.ExternalApiCallLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Component
public class CompaniesHouseClient {

    private static final Logger log = LoggerFactory.getLogger(CompaniesHouseClient.class);
    private static final String PROVIDER = "companies-house";

    private final RestClient http;
    private final CompaniesHouseProperties props;
    private final ExternalApiCallLogRepository logRepo;
    private final AlertService alerts;
    private final ObjectMapper mapper;

    public CompaniesHouseClient(CompaniesHouseProperties props,
                                ExternalApiCallLogRepository logRepo,
                                AlertService alerts,
                                ObjectMapper mapper) {
        this.props = props;
        this.logRepo = logRepo;
        this.alerts = alerts;
        this.mapper = mapper;
        this.http = RestClient.builder()
                .baseUrl(props.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, basicAuthHeader(props.getApiKey()))
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .defaultHeader(HttpHeaders.USER_AGENT, "CareerMoveChecker/0.1")
                .build();
    }

    public Optional<JsonNode> searchCompanies(String query) {
        return get("/search/companies", Map.of("q", query, "items_per_page", "20"), null, "search");
    }

    public Optional<JsonNode> profile(String companyNumber) {
        return get("/company/" + companyNumber, Map.of(), companyNumber, "profile");
    }

    public Optional<JsonNode> registeredOffice(String companyNumber) {
        return get("/company/" + companyNumber + "/registered-office-address", Map.of(), companyNumber, "registered-office");
    }

    public Optional<JsonNode> officers(String companyNumber) {
        return get("/company/" + companyNumber + "/officers", Map.of("items_per_page", "35"), companyNumber, "officers");
    }

    public Optional<JsonNode> psc(String companyNumber) {
        // 404 = no PSC entries declared (relatively common for small companies)
        return get("/company/" + companyNumber + "/persons-with-significant-control", Map.of(), companyNumber, "psc", true);
    }

    public Optional<JsonNode> charges(String companyNumber) {
        // 404 = no charges on file (normal for many companies)
        return get("/company/" + companyNumber + "/charges", Map.of(), companyNumber, "charges", true);
    }

    public Optional<JsonNode> filingHistory(String companyNumber) {
        return get("/company/" + companyNumber + "/filing-history", Map.of("items_per_page", "50"), companyNumber, "filing-history");
    }

    public Optional<JsonNode> insolvency(String companyNumber) {
        // 404 = no insolvency cases (the GOOD outcome for most companies)
        return get("/company/" + companyNumber + "/insolvency", Map.of(), companyNumber, "insolvency", true);
    }

    public Optional<JsonNode> searchDisqualifiedOfficers(String name) {
        // 404 = name not on disqualified register (the GOOD outcome we want)
        return get("/search/disqualified-officers", Map.of("q", name, "items_per_page", "5"), null, "disqualified-search", true);
    }

    private Optional<JsonNode> get(String path, Map<String, String> params, String companyNumber, String shortName) {
        return get(path, params, companyNumber, shortName, false);
    }

    private Optional<JsonNode> get(String path, Map<String, String> params, String companyNumber, String shortName, boolean notFoundIsOk) {
        String endpoint = endpointName(path, companyNumber);
        if (props.getApiKey() == null || props.getApiKey().isBlank()) {
            recordLog(endpoint, companyNumber, 401, false, 0, "Missing COMPANIES_HOUSE_API_KEY");
            alerts.raise(PROVIDER, endpoint, companyNumber, null,
                    DownstreamAlert.AlertType.API_FAILURE,
                    DownstreamAlert.Severity.CRITICAL,
                    "Missing Companies House API key",
                    "COMPANIES_HOUSE_API_KEY is not configured. Set it in the environment.",
                    Map.of("envVar", "COMPANIES_HOUSE_API_KEY"));
            return Optional.empty();
        }

        long start = System.nanoTime();
        try {
            JsonNode body = http.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path(path);
                        params.forEach(uriBuilder::queryParam);
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);

            int dur = (int) Duration.ofNanos(System.nanoTime() - start).toMillis();
            recordLog(endpoint, companyNumber, 200, true, dur, null);
            return Optional.ofNullable(body);
        } catch (HttpClientErrorException ex) {
            int dur = (int) Duration.ofNanos(System.nanoTime() - start).toMillis();
            int code = ex.getStatusCode().value();
            // 404 on endpoints where "no records" is the expected normal response = success
            boolean isExpected404 = code == 404 && notFoundIsOk;
            recordLog(endpoint, companyNumber, code, isExpected404, dur, isExpected404 ? null : ex.getMessage());
            if (!isExpected404) handleClientError(endpoint, companyNumber, ex.getStatusCode(), shortName);
            if (code == 404) return Optional.empty();
            throw new CompaniesHouseException(code, endpoint, ex.getMessage(), ex);
        } catch (HttpServerErrorException ex) {
            int dur = (int) Duration.ofNanos(System.nanoTime() - start).toMillis();
            int code = ex.getStatusCode().value();
            recordLog(endpoint, companyNumber, code, false, dur, ex.getMessage());
            alerts.raise(PROVIDER, endpoint, companyNumber, null,
                    DownstreamAlert.AlertType.API_FAILURE,
                    DownstreamAlert.Severity.WARNING,
                    "Companies House " + code,
                    "Server error from Companies House on " + shortName,
                    Map.of("status", code));
            throw new CompaniesHouseException(code, endpoint, ex.getMessage(), ex);
        } catch (ResourceAccessException ex) {
            int dur = (int) Duration.ofNanos(System.nanoTime() - start).toMillis();
            recordLog(endpoint, companyNumber, 0, false, dur, ex.getMessage());
            alerts.raise(PROVIDER, endpoint, companyNumber, null,
                    DownstreamAlert.AlertType.TIMEOUT,
                    DownstreamAlert.Severity.WARNING,
                    "Companies House timeout/network",
                    "Network error talking to Companies House on " + shortName,
                    Map.of("error", String.valueOf(ex.getMessage())));
            throw new CompaniesHouseException(0, endpoint, "Network error", ex);
        } catch (Exception ex) {
            int dur = (int) Duration.ofNanos(System.nanoTime() - start).toMillis();
            recordLog(endpoint, companyNumber, -1, false, dur, ex.getMessage());
            log.error("Unexpected error calling {}", endpoint, ex);
            throw new CompaniesHouseException(-1, endpoint, ex.getMessage(), ex);
        }
    }

    private void handleClientError(String endpoint, String companyNumber, HttpStatusCode status, String shortName) {
        int code = status.value();
        if (code == 401) {
            alerts.raise(PROVIDER, endpoint, companyNumber, null,
                    DownstreamAlert.AlertType.API_FAILURE,
                    DownstreamAlert.Severity.CRITICAL,
                    "Companies House 401 unauthorized",
                    "API key rejected. Check COMPANIES_HOUSE_API_KEY.",
                    Map.of("status", 401));
        } else if (code == 403) {
            alerts.raise(PROVIDER, endpoint, companyNumber, null,
                    DownstreamAlert.AlertType.API_FAILURE,
                    DownstreamAlert.Severity.CRITICAL,
                    "Companies House 403 forbidden",
                    "Forbidden on " + shortName,
                    Map.of("status", 403));
        } else if (code == 429) {
            alerts.raise(PROVIDER, endpoint, companyNumber, null,
                    DownstreamAlert.AlertType.RATE_LIMIT,
                    DownstreamAlert.Severity.WARNING,
                    "Companies House rate limit",
                    "Hit 429 on " + shortName + ". Back off and retry.",
                    Map.of("status", 429));
        }
    }

    private void recordLog(String endpoint, String companyNumber, int status, boolean success, int durationMs, String err) {
        try {
            ExternalApiCallLog row = new ExternalApiCallLog();
            row.setProvider(PROVIDER);
            row.setEndpoint(endpoint);
            row.setCompanyNumber(companyNumber);
            row.setStatusCode(status);
            row.setSuccess(success);
            row.setDurationMs(durationMs);
            row.setErrorMessage(err != null && err.length() > 2000 ? err.substring(0, 2000) : err);
            logRepo.save(row);
        } catch (Exception ignored) {
            // observability must never break a request
        }
    }

    private static String endpointName(String path, String companyNumber) {
        if (companyNumber != null) {
            return path.replace(companyNumber, "{n}");
        }
        return path;
    }

    private static String basicAuthHeader(String key) {
        String token = Base64.getEncoder().encodeToString((key + ":").getBytes(StandardCharsets.UTF_8));
        return "Basic " + token;
    }
}
