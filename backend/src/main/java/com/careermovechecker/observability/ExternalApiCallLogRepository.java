package com.careermovechecker.observability;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface ExternalApiCallLogRepository extends JpaRepository<ExternalApiCallLog, Long> {

    @Query("SELECT COUNT(l) FROM ExternalApiCallLog l WHERE l.createdAt > :since AND l.success = true")
    long countSuccessSince(@Param("since") Instant since);

    @Query("SELECT COUNT(l) FROM ExternalApiCallLog l WHERE l.createdAt > :since")
    long countAllSince(@Param("since") Instant since);

    @Query("SELECT AVG(l.durationMs) FROM ExternalApiCallLog l WHERE l.createdAt > :since")
    Double avgDurationSince(@Param("since") Instant since);

    @Query("SELECT COUNT(l) FROM ExternalApiCallLog l WHERE l.createdAt > :since AND l.success = false")
    long countErrorsSince(@Param("since") Instant since);
}
