package com.careermovechecker.tracking;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@RequestMapping("/api/track")
public class TrackController {

    private static final Logger log = LoggerFactory.getLogger(TrackController.class);

    private final PageViewRepository pages;
    private final CtaClickRepository ctas;
    private final ObjectMapper json;

    public TrackController(PageViewRepository pages, CtaClickRepository ctas, ObjectMapper json) {
        this.pages = pages;
        this.ctas = ctas;
        this.json = json;
    }

    public record PageView(String path, String referrer, String persona, String sessionId, boolean firstVisit) {}

    public record Cta(String ctaId, String path, String persona, String sessionId, Map<String, Object> metadata) {}

    @PostMapping("/page-view")
    public ResponseEntity<Void> pageView(@RequestBody PageView v, HttpServletRequest http) {
        try {
            PageViewEvent ev = new PageViewEvent();
            ev.setPath(safe(v.path(), 256));
            ev.setReferrer(safe(v.referrer(), 512));
            ev.setPersona(safe(v.persona(), 16));
            ev.setAnonymousSessionId(safe(v.sessionId(), 64));
            ev.setUserAgentHash(hash(http.getHeader("User-Agent")));
            ev.setFirstVisit(v.firstVisit());
            pages.save(ev);
        } catch (Exception e) {
            log.debug("page-view track failed", e);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cta")
    public ResponseEntity<Void> cta(@RequestBody Cta c) {
        try {
            CtaClickEvent ev = new CtaClickEvent();
            ev.setCtaId(safe(c.ctaId(), 64));
            ev.setPath(safe(c.path(), 256));
            ev.setPersona(safe(c.persona(), 16));
            ev.setAnonymousSessionId(safe(c.sessionId(), 64));
            try { ev.setMetadataJson(json.writeValueAsString(c.metadata() == null ? Map.of() : c.metadata())); }
            catch (JsonProcessingException e) { ev.setMetadataJson("{}"); }
            ctas.save(ev);
        } catch (Exception e) {
            log.debug("cta track failed", e);
        }
        return ResponseEntity.noContent().build();
    }

    private static String safe(String s, int max) {
        if (s == null) return null;
        return s.length() > max ? s.substring(0, max) : s;
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
