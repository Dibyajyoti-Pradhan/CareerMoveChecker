package com.careermovechecker.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface CompanySearchEventRepository extends JpaRepository<CompanySearchEvent, Long> {

    long countByCreatedAtAfter(Instant since);

    long countByResultCountAndCreatedAtAfter(int resultCount, Instant since);

    @Query("SELECT e.selectedCompanyName as name, e.selectedCompanyNumber as number, COUNT(e) as cnt " +
            "FROM CompanySearchEvent e WHERE e.selectedCompanyNumber IS NOT NULL AND e.createdAt > :since " +
            "GROUP BY e.selectedCompanyName, e.selectedCompanyNumber ORDER BY COUNT(e) DESC")
    List<TopSearchedRow> topSearched(@Param("since") Instant since, org.springframework.data.domain.Pageable page);

    interface TopSearchedRow {
        String getName();
        String getNumber();
        long getCnt();
    }

    @Query("SELECT e.normalizedQuery as query, COUNT(e) as cnt " +
            "FROM CompanySearchEvent e WHERE e.resultCount = 0 AND e.createdAt > :since " +
            "GROUP BY e.normalizedQuery ORDER BY COUNT(e) DESC")
    List<NoResultRow> topNoResult(@Param("since") Instant since, org.springframework.data.domain.Pageable page);

    interface NoResultRow {
        String getQuery();
        long getCnt();
    }

    @Query(value = "SELECT TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') as day, COUNT(*) as cnt " +
            "FROM company_search_events WHERE created_at > :since GROUP BY 1 ORDER BY 1", nativeQuery = true)
    List<DailyRow> searchesByDay(@Param("since") Instant since);

    interface DailyRow {
        String getDay();
        long getCnt();
    }
}
