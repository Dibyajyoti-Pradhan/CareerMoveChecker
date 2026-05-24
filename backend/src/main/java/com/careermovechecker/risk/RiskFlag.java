package com.careermovechecker.risk;

public record RiskFlag(
        String id,
        Severity severity,
        String title,
        String explanation,
        String evidence,
        String recommendedAction
) {
    public enum Severity { POSITIVE, INFO, WARNING, CRITICAL }
}
