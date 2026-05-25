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

    org.springframework.data.domain.Page<CompanyRiskReport> findAllByOrderByUpdatedAtDesc(org.springframework.data.domain.Pageable page);

    @Query("SELECT " +
            "COUNT(CASE WHEN r.dataFetchedAt > :h6  THEN 1 END) as fresh6h, " +
            "COUNT(CASE WHEN r.dataFetchedAt > :h24 AND r.dataFetchedAt <= :h6  THEN 1 END) as fresh24h, " +
            "COUNT(CASE WHEN r.dataFetchedAt > :d7  AND r.dataFetchedAt <= :h24 THEN 1 END) as fresh7d, " +
            "COUNT(CASE WHEN r.dataFetchedAt <= :d7 THEN 1 END) as stale " +
            "FROM CompanyRiskReport r")
    FreshnessBuckets freshnessBuckets(Instant h6, Instant h24, Instant d7);

    interface FreshnessBuckets {
        long getFresh6h();
        long getFresh24h();
        long getFresh7d();
        long getStale();
    }
}
