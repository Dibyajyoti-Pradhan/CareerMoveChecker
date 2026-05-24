package com.careermovechecker.companieshouse;

public class CompaniesHouseException extends RuntimeException {
    private final int statusCode;
    private final String endpoint;

    public CompaniesHouseException(int statusCode, String endpoint, String message) {
        super(message);
        this.statusCode = statusCode;
        this.endpoint = endpoint;
    }

    public CompaniesHouseException(int statusCode, String endpoint, String message, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.endpoint = endpoint;
    }

    public int getStatusCode() { return statusCode; }
    public String getEndpoint() { return endpoint; }
}
