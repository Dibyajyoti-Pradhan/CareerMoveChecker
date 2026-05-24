package com.careermovechecker.risk;

public enum RiskLevel {
    LOW, MODERATE, HIGH, CRITICAL;

    public static RiskLevel fromScore(int score) {
        if (score >= 80) return LOW;
        if (score >= 60) return MODERATE;
        if (score >= 40) return HIGH;
        return CRITICAL;
    }
}
