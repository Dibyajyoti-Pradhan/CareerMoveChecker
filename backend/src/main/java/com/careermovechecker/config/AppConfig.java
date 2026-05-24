package com.careermovechecker.config;

import com.careermovechecker.companieshouse.CompaniesHouseProperties;
import com.careermovechecker.risk.RiskScoringProperties;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({ CompaniesHouseProperties.class, RiskScoringProperties.class })
@ConfigurationPropertiesScan
public class AppConfig {
}
