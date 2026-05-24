package com.careermovechecker.companieshouse;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cmc.companies-house")
public class CompaniesHouseProperties {
    private String baseUrl = "https://api.company-information.service.gov.uk";
    private String apiKey = "";
    private int timeoutMs = 8000;

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String v) { baseUrl = v; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String v) { apiKey = v; }
    public int getTimeoutMs() { return timeoutMs; }
    public void setTimeoutMs(int v) { timeoutMs = v; }
}
