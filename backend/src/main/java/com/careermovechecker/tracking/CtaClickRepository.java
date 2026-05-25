package com.careermovechecker.tracking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface CtaClickRepository extends JpaRepository<CtaClickEvent, Long> {

    @Query("SELECT c.ctaId as ctaId, COUNT(c) as cnt FROM CtaClickEvent c WHERE c.createdAt > :since GROUP BY c.ctaId ORDER BY COUNT(c) DESC")
    List<CtaCount> topCtas(@Param("since") Instant since);

    interface CtaCount {
        String getCtaId();
        long getCnt();
    }
}
