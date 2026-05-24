package com.careermovechecker.risk;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cmc.risk")
public class RiskScoringProperties {
    private ScoringEngineType engine = ScoringEngineType.RULE_BASED;
    private String modelVersion = "rules-v1";

    public ScoringEngineType getEngine() { return engine; }
    public void setEngine(ScoringEngineType engine) { this.engine = engine; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
