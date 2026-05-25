package com.careermovechecker.alerts;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface WatchListAlertRepository extends JpaRepository<WatchListAlert, Long> {
    List<WatchListAlert> findTop200ByOrderByOccurredAtDesc();
    long countByUnread(boolean unread);
    List<WatchListAlert> findByOccurredAtAfterOrderByOccurredAtDesc(Instant since);
}
