package com.careermovechecker.risk;

public interface RiskScoringEngine {
    ScoringEngineType engineType();
    String modelVersion();
    RiskAssessment assess(RiskScoringContext context);
}
