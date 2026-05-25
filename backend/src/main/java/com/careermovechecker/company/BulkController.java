package com.careermovechecker.company;

import com.careermovechecker.company.dto.CompanyReportDto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/companies/bulk")
public class BulkController {

    private static final Logger log = LoggerFactory.getLogger(BulkController.class);

    private final CompanyService companyService;

    public BulkController(CompanyService companyService) {
        this.companyService = companyService;
    }

    public record BulkRequest(@NotNull @Size(min = 1, max = 100) List<String> companyNumbers) {}

    public record BulkRow(
            int index,
            String input,
            boolean matched,
            String companyNumber,
            String companyName,
            String companyStatus,
            String riskLevel,
            Integer score,
            Double confidence,
            String bucket
    ) {}

    public record BulkResult(
            String uploadId,
            String uploadedAt,
            int totalRows,
            int matched,
            int unmatched,
            List<BulkRow> rows
    ) {}

    @PostMapping
    public BulkResult bulk(@RequestBody BulkRequest req) {
        String uploadId = UUID.randomUUID().toString().substring(0, 8);
        Instant now = Instant.now();
        List<BulkRow> rows = new ArrayList<>();

        IntStream.range(0, req.companyNumbers().size()).forEach(i -> {
            String raw = req.companyNumbers().get(i).trim();
            try {
                var report = companyService.getOrComputeReport(raw, false, "bulk");
                if (report.isPresent()) {
                    CompanyReportDto r = report.get();
                    String bucket = bucketFor(r);
                    rows.add(new BulkRow(
                            i + 1, raw, true,
                            r.profile().companyNumber(),
                            r.profile().companyName(),
                            r.profile().companyStatus(),
                            r.assessment().riskLevel().name(),
                            r.assessment().score(),
                            r.assessment().confidence(),
                            bucket
                    ));
                } else {
                    rows.add(new BulkRow(i + 1, raw, false, null, null, null, null, null, null, "unmatched"));
                }
            } catch (Exception e) {
                log.warn("Bulk lookup failed for {}", raw, e);
                rows.add(new BulkRow(i + 1, raw, false, null, null, null, null, null, null, "unmatched"));
            }
        });

        long matched = rows.stream().filter(BulkRow::matched).count();
        return new BulkResult(uploadId, now.toString(), rows.size(), (int) matched, rows.size() - (int) matched, rows);
    }

    private String bucketFor(CompanyReportDto r) {
        return switch (r.assessment().riskLevel()) {
            case LOW -> "safe";
            case MODERATE, HIGH -> "watch";
            case CRITICAL -> "avoid";
        };
    }
}
