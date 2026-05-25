package com.careermovechecker.waitlist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<WaitlistSignup, Long> {
    Optional<WaitlistSignup> findByEmail(String email);
    Page<WaitlistSignup> findAllByOrderByCreatedAtDesc(Pageable page);
    long countByCreatedAtAfter(Instant since);

    @Query("SELECT w.tier as tier, COUNT(w) as cnt FROM WaitlistSignup w GROUP BY w.tier")
    List<TierCount> countByTier();

    interface TierCount {
        String getTier();
        long getCnt();
    }

    @Query("SELECT w.persona as persona, COUNT(w) as cnt FROM WaitlistSignup w GROUP BY w.persona")
    List<PersonaCount> countByPersona();

    interface PersonaCount {
        String getPersona();
        long getCnt();
    }
}
