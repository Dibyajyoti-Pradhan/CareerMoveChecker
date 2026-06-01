package com.careermovechecker.company;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SnapshotPurgeJob {

    private static final Logger log = LoggerFactory.getLogger(SnapshotPurgeJob.class);

    private final CompanyRawSnapshotRepository repo;
    private final int retentionDays;

    public SnapshotPurgeJob(
            CompanyRawSnapshotRepository repo,
            @Value("${cmc.cache.snapshot-retention-days:30}") int retentionDays) {
        this.repo = repo;
        this.retentionDays = retentionDays;
    }

    // Daily at 03:00 UTC. Cron format: sec min hour day-of-month month day-of-week.
    @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
    @Transactional
    public void purge() {
        long start = System.currentTimeMillis();
        int deleted = repo.purgeOlderThanDaysKeepingLatest(retentionDays);
        long took = System.currentTimeMillis() - start;
        log.info("Snapshot purge complete — deleted {} rows older than {} days (kept latest per endpoint), took {} ms",
                deleted, retentionDays, took);
    }
}
