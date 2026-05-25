package com.careermovechecker.tracking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface PageViewRepository extends JpaRepository<PageViewEvent, Long> {

    long countByCreatedAtAfter(Instant since);

    @Query("SELECT COUNT(DISTINCT v.anonymousSessionId) FROM PageViewEvent v WHERE v.createdAt > :since")
    long countDistinctSessionsSince(@Param("since") Instant since);

    @Query("SELECT COUNT(v) FROM PageViewEvent v WHERE v.firstVisit = true AND v.createdAt > :since")
    long countFirstVisitsSince(@Param("since") Instant since);

    @Query("SELECT v.path as path, COUNT(v) as cnt, COUNT(DISTINCT v.anonymousSessionId) as uniques " +
            "FROM PageViewEvent v WHERE v.createdAt > :since GROUP BY v.path ORDER BY COUNT(v) DESC")
    List<PathStat> topPaths(@Param("since") Instant since, org.springframework.data.domain.Pageable page);

    interface PathStat {
        String getPath();
        long getCnt();
        long getUniques();
    }

    @Query("SELECT COUNT(DISTINCT v.anonymousSessionId) FROM PageViewEvent v WHERE v.path = :path AND v.createdAt > :since")
    long countSessionsForPath(@Param("path") String path, @Param("since") Instant since);

    @Query("SELECT COUNT(DISTINCT v.anonymousSessionId) FROM PageViewEvent v WHERE v.path LIKE :pathPrefix AND v.createdAt > :since")
    long countSessionsForPathPrefix(@Param("pathPrefix") String pathPrefix, @Param("since") Instant since);

    @Query(value = "SELECT TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') as day, " +
            "COUNT(*) as views, COUNT(DISTINCT anonymous_session_id) as sessions " +
            "FROM page_view_events WHERE created_at > :since GROUP BY 1 ORDER BY 1", nativeQuery = true)
    List<DailyRow> byDay(@Param("since") Instant since);

    interface DailyRow {
        String getDay();
        long getViews();
        long getSessions();
    }

    @Query(value = "SELECT referrer, COUNT(*) as cnt FROM page_view_events " +
            "WHERE created_at > :since AND referrer IS NOT NULL AND referrer != '' " +
            "GROUP BY referrer ORDER BY cnt DESC LIMIT 20", nativeQuery = true)
    List<ReferrerRow> topReferrers(@Param("since") Instant since);

    interface ReferrerRow {
        String getReferrer();
        long getCnt();
    }
}
