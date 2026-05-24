package com.careermovechecker.saved;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedCompanyRepository extends JpaRepository<SavedCompany, Long> {
    List<SavedCompany> findAllByOrderByUpdatedAtDesc();
    Optional<SavedCompany> findByCompanyNumber(String companyNumber);
    void deleteByCompanyNumber(String companyNumber);
}
