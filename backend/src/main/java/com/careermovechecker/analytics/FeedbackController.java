package com.careermovechecker.analytics;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackEventRepository repo;

    public FeedbackController(FeedbackEventRepository repo) {
        this.repo = repo;
    }

    public record FeedbackRequest(
            @NotBlank String companyNumber,
            @Min(1) @Max(5) int rating,
            @NotNull FeedbackEvent.UseCase useCase,
            String comment
    ) {}

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@RequestBody @Valid FeedbackRequest req) {
        FeedbackEvent e = new FeedbackEvent();
        e.setCompanyNumber(req.companyNumber());
        e.setRating((short) req.rating());
        e.setUseCase(req.useCase());
        e.setComment(req.comment());
        repo.save(e);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
