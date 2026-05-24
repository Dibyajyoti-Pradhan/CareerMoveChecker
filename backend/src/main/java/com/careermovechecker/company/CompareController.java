package com.careermovechecker.company;

import com.careermovechecker.company.dto.CompanyReportDto;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/compare")
public class CompareController {

    private final CompanyService service;

    public CompareController(CompanyService service) {
        this.service = service;
    }

    public record CompareRequest(@Size(min = 1, max = 3) List<String> companyNumbers) {}

    @PostMapping
    public List<CompanyReportDto> compare(@RequestBody CompareRequest req) {
        if (req == null || req.companyNumbers() == null) return List.of();
        return req.companyNumbers().stream()
                .limit(3)
                .map(n -> service.getOrComputeReport(n, false, "compare"))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
    }
}
