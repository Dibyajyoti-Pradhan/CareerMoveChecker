package com.careermovechecker.waitlist;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistRepository repo;

    public WaitlistController(WaitlistRepository repo) {
        this.repo = repo;
    }

    public record WaitlistRequest(
            @NotBlank @Email String email,
            String persona,
            String tier,
            String role,
            String referrer,
            String landingPath,
            String anonymousSessionId
    ) {}

    @PostMapping
    public ResponseEntity<Map<String, Object>> signup(@RequestBody @Valid WaitlistRequest req, HttpServletRequest http) {
        String email = req.email().trim().toLowerCase();

        var existing = repo.findByEmail(email);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("ok", true, "alreadyOnList", true, "id", existing.get().getId()));
        }
        WaitlistSignup s = new WaitlistSignup();
        s.setEmail(email);
        s.setPersona(req.persona());
        s.setTier(req.tier());
        s.setRole(req.role());
        s.setReferrer(req.referrer());
        s.setLandingPath(req.landingPath());
        s.setAnonymousSessionId(req.anonymousSessionId());
        s.setUserAgentHash(hash(http.getHeader("User-Agent")));
        s.setIpHash(hash(http.getRemoteAddr()));
        repo.save(s);
        return ResponseEntity.ok(Map.of("ok", true, "alreadyOnList", false, "id", s.getId()));
    }

    private static String hash(String v) {
        if (v == null || v.isBlank()) return null;
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(v.getBytes(StandardCharsets.UTF_8))).substring(0, 32);
        } catch (Exception e) {
            return null;
        }
    }
}
