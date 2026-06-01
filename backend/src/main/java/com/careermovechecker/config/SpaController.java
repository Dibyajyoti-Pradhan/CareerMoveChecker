package com.careermovechecker.config;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.concurrent.TimeUnit;

/**
 * SPA fallback — returns index.html bytes directly (no forward).
 *
 * Forwarding via `forward:/index.html` re-enters the DispatcherServlet which
 * causes Spring Security to re-wrap the request on every pass, eventually
 * blowing the stack in HttpServletRequestWrapper.getQueryString(). Returning
 * the resource bytes directly avoids the re-entry entirely.
 *
 * Path patterns:
 * - "/"                                 — bare root
 * - "/{path:(?!api|actuator|assets)[^.]+}" — single segment with no dot,
 *   excluding the api/actuator/assets prefixes (so API calls and Vite asset
 *   requests fall through to their real handlers)
 * - the same plus "/**" — single segment + any subpath (so deep SPA routes
 *   like /app/company/09446231 resolve to the React app)
 */
@Controller
public class SpaController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> root() {
        return serveIndex();
    }

    @GetMapping(value = "/{path:(?!api|actuator|assets)[^.]+}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> oneSegment() {
        return serveIndex();
    }

    @GetMapping(value = "/{path:(?!api|actuator|assets)[^.]+}/**", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> deepRoute() {
        return serveIndex();
    }

    private ResponseEntity<Resource> serveIndex() {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .header("X-Content-Type-Options", "nosniff")
                .body(new ClassPathResource("static/index.html"));
    }

    // Silence Tomcat's start-up warning about unused field if any future tool inspects it.
    @SuppressWarnings("unused")
    private static final long CACHE_MAX_AGE_SECONDS = TimeUnit.MINUTES.toSeconds(0);
}
