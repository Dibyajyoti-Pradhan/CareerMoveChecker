package com.careermovechecker.risk;

import java.util.List;

public record RiskAssessment(
        int score,
        RiskLevel riskLevel,
        String verdict,
        List<String> topReasons,
        List<RiskFlag> flags,
        List<RecommendedAction> recommendedActions,
        ScoringEngineType engineType,
        String modelVersion,
        String explanationSummary,
        double confidence
) {
}
