package com.careermovechecker.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CompanyRawSnapshotRepository extends JpaRepository<CompanyRawSnapshot, Long> {
    Optional<CompanyRawSnapshot> findFirstByCompanyNumberAndSourceTypeOrderByFetchedAtDesc(
            String companyNumber, CompanyRawSnapshot.SourceType sourceType);

    /**
     * Purge snapshot rows older than {@code days} days, keeping the latest row
     * per (company_number, source_type) regardless of age. Returns rows deleted.
     */
    @Modifying
    @Query(value = """
            DELETE FROM company_raw_snapshots
            WHERE id IN (
              SELECT id FROM (
                SELECT id,
                       fetched_at,
                       ROW_NUMBER() OVER (PARTITION BY company_number, source_type
                                          ORDER BY fetched_at DESC) AS rn
                FROM company_raw_snapshots
              ) t
              WHERE t.rn > 1
                AND t.fetched_at < NOW() - (:days || ' days')::interval
            )
            """, nativeQuery = true)
    int purgeOlderThanDaysKeepingLatest(@Param("days") int days);
}
