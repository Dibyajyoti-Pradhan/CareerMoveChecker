package com.careermovechecker.analytics;

import com.careermovechecker.risk.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface CompanyReportViewRepository extends JpaRepository<CompanyReportView, Long> {
    long countByCreatedAtAfter(Instant since);

    @Query("SELECT v.companyName as name, v.companyNumber as number, COUNT(v) as views, " +
            "(SELECT MAX(v2.riskLevel) FROM CompanyReportView v2 WHERE v2.companyNumber = v.companyNumber) as level " +
            "FROM CompanyReportView v WHERE v.createdAt > :since " +
            "GROUP BY v.companyName, v.companyNumber ORDER BY COUNT(v) DESC")
    List<TopViewedRow> topViewed(@Param("since") Instant since, org.springframework.data.domain.Pageable page);

    interface TopViewedRow {
        String getName();
        String getNumber();
        long getViews();
        RiskLevel getLevel();
    }

    @Query(value = "SELECT TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') as day, COUNT(*) as cnt " +
            "FROM company_report_views WHERE created_at > :since GROUP BY 1 ORDER BY 1", nativeQuery = true)
    List<DailyRow> viewsByDay(@Param("since") Instant since);

    interface DailyRow {
        String getDay();
        long getCnt();
    }
}
