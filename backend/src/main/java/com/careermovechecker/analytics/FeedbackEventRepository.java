package com.careermovechecker.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface FeedbackEventRepository extends JpaRepository<FeedbackEvent, Long> {

    @Query("SELECT f.useCase as useCase, COUNT(f) as cnt FROM FeedbackEvent f WHERE f.createdAt > :since GROUP BY f.useCase")
    List<UseCaseCount> breakdown(@Param("since") Instant since);

    interface UseCaseCount {
        FeedbackEvent.UseCase getUseCase();
        long getCnt();
    }
}
