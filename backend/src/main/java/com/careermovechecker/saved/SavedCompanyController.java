package com.careermovechecker.saved;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/saved-companies")
public class SavedCompanyController {

    private final SavedCompanyRepository repo;

    public SavedCompanyController(SavedCompanyRepository repo) {
        this.repo = repo;
    }

    public record SaveRequest(@NotBlank String companyNumber, @NotBlank String companyName, String note) {}
    public record UpdateRequest(String note) {}

    @GetMapping
    public List<SavedCompany> list() {
        return repo.findAllByOrderByUpdatedAtDesc();
    }

    @PostMapping
    @Transactional
    public SavedCompany save(@RequestBody @Valid SaveRequest req) {
        SavedCompany s = repo.findByCompanyNumber(req.companyNumber()).orElseGet(SavedCompany::new);
        s.setCompanyNumber(req.companyNumber());
        s.setCompanyName(req.companyName());
        if (req.note() != null) s.setNote(req.note());
        s.setUpdatedAt(Instant.now());
        return repo.save(s);
    }

    @PutMapping("/{companyNumber}")
    @Transactional
    public ResponseEntity<SavedCompany> update(@PathVariable String companyNumber,
                                               @RequestBody UpdateRequest req) {
        return repo.findByCompanyNumber(companyNumber).map(s -> {
            s.setNote(req.note());
            s.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(repo.save(s));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{companyNumber}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable String companyNumber) {
        repo.deleteByCompanyNumber(companyNumber);
        return ResponseEntity.noContent().build();
    }
}
