package com.careermovechecker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // SPA fallback — anything not /api, not /actuator, and without a file
        // extension (no dot) forwards to index.html.
        //
        // The [^.]+ guard is critical: without it, the pattern matches
        // "index.html" itself and the forward loops forever, each pass adding
        // another SecurityContextHolderAwareRequestFilter wrapper to the
        // request and eventually blowing the stack.
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/{path:^(?!api|actuator)[^.]+$}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{path:^(?!api|actuator)[^.]+$}/{*subpath}")
                .setViewName("forward:/index.html");
    }
}
