package com.careermovechecker.company;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRawSnapshotRepository extends JpaRepository<CompanyRawSnapshot, Long> {
    Optional<CompanyRawSnapshot> findFirstByCompanyNumberAndSourceTypeOrderByFetchedAtDesc(
            String companyNumber, CompanyRawSnapshot.SourceType sourceType);
}
