package com.careermovechecker.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DownstreamAlertRepository extends JpaRepository<DownstreamAlert, Long> {
    List<DownstreamAlert> findAllByOrderByLastSeenAtDesc();
    long countByStatus(DownstreamAlert.Status status);
}
