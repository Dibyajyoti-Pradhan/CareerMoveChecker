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
}
