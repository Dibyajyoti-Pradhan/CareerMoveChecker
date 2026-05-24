package com.careermovechecker.risk;

import com.careermovechecker.company.dto.CompanyData;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
public class RiskScoringService {

    private final RiskSignalExtractor extractor;
    private final RiskScoringProperties props;
    private final Map<ScoringEngineType, RiskScoringEngine> engines;

    public RiskScoringService(RiskSignalExtractor extractor,
                              RiskScoringProperties props,
                              List<RiskScoringEngine> engineBeans) {
        this.extractor = extractor;
        this.props = props;
        this.engines = engineBeans.stream()
                .collect(java.util.stream.Collectors.toMap(RiskScoringEngine::engineType, e -> e));
    }

    public ScoredAssessment score(CompanyData company) {
        var signals = extractor.extract(company);
        var ctx = new RiskScoringContext(company, signals, List.of(), Instant.now());
        var engine = engines.get(props.getEngine());
        if (engine == null) {
            engine = engines.get(ScoringEngineType.RULE_BASED);
        }
        var assessment = engine.assess(ctx);
        return new ScoredAssessment(assessment, fingerprint(company));
    }

    public String fingerprint(CompanyData c) {
        String key = String.join("|",
                nz(c.companyNumber()), nz(c.companyStatus()),
                String.valueOf(c.incorporatedOn()),
                String.valueOf(Boolean.TRUE.equals(c.accountsOverdue())),
                String.valueOf(Boolean.TRUE.equals(c.confirmationStatementOverdue())),
                String.valueOf(c.officers() == null ? 0 : c.officers().size()),
                String.valueOf(c.psc() == null ? 0 : c.psc().size()),
                String.valueOf(c.charges() == null ? 0 : c.charges().size()),
                String.valueOf(c.filings() == null ? 0 : c.filings().size()),
                String.valueOf(c.insolvency() == null ? 0 : c.insolvency().size())
        );
        try {
            var md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(key.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 32);
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(key.hashCode());
        }
    }

    private static String nz(String s) { return s == null ? "" : s; }

    public record ScoredAssessment(RiskAssessment assessment, String inputFingerprint) {}
}
