package com.careermovechecker.company;

import com.careermovechecker.risk.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CompanyRiskReportRepository extends JpaRepository<CompanyRiskReport, Long> {
    Optional<CompanyRiskReport> findByCompanyNumber(String companyNumber);

    @Query("SELECT r.riskLevel as level, COUNT(r) as count FROM CompanyRiskReport r WHERE r.computedAt >= :since GROUP BY r.riskLevel")
    List<RiskLevelCount> riskDistributionSince(Instant since);

    interface RiskLevelCount {
        RiskLevel getLevel();
        long getCount();
    }

    List<CompanyRiskReport> findTop10ByOrderByUpdatedAtDesc();
}
