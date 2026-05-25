package com.careermovechecker.observability;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ExternalApiCallLogRepository extends JpaRepository<ExternalApiCallLog, Long> {

    @Query("SELECT COUNT(l) FROM ExternalApiCallLog l WHERE l.createdAt > :since AND l.success = true")
    long countSuccessSince(@Param("since") Instant since);

    @Query("SELECT COUNT(l) FROM ExternalApiCallLog l WHERE l.createdAt > :since")
    long countAllSince(@Param("since") Instant since);

    @Query("SELECT AVG(l.durationMs) FROM ExternalApiCallLog l WHERE l.createdAt > :since")
    Double avgDurationSince(@Param("since") Instant since);

    @Query("SELECT COUNT(l) FROM ExternalApiCallLog l WHERE l.createdAt > :since AND l.success = false")
    long countErrorsSince(@Param("since") Instant since);

    @Query("SELECT l.endpoint as endpoint, " +
            "COUNT(l) as total, " +
            "SUM(CASE WHEN l.success = true THEN 1 ELSE 0 END) as successCount, " +
            "AVG(l.durationMs) as avgMs, " +
            "MAX(l.durationMs) as maxMs " +
            "FROM ExternalApiCallLog l WHERE l.createdAt > :since GROUP BY l.endpoint ORDER BY COUNT(l) DESC")
    List<EndpointStat> endpointStatsSince(@Param("since") Instant since);

    interface EndpointStat {
        String getEndpoint();
        long getTotal();
        long getSuccessCount();
        Double getAvgMs();
        Integer getMaxMs();
    }

    Page<ExternalApiCallLog> findAllByOrderByCreatedAtDesc(Pageable page);
}
