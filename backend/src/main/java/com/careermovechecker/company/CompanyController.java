package com.careermovechecker.company;

import com.careermovechecker.common.ApiException;
import com.careermovechecker.company.dto.CompanyReportDto;
import com.careermovechecker.company.dto.CompanySearchHitDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/search")
    public List<CompanySearchHitDto> search(@RequestParam("q") String q) {
        if (q == null || q.isBlank()) return List.of();
        return companyService.search(q.trim());
    }

    @GetMapping("/{companyNumber}/report")
    public CompanyReportDto report(@PathVariable String companyNumber) {
        return companyService.getOrComputeReport(companyNumber, false, "direct_url")
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Company not found: " + companyNumber));
    }

    @PostMapping("/{companyNumber}/refresh")
    public ResponseEntity<CompanyReportDto> refresh(@PathVariable String companyNumber) {
        return companyService.getOrComputeReport(companyNumber, true, "refresh")
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
