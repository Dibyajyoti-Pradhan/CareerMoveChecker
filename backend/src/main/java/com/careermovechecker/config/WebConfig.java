package com.careermovechecker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // SPA fallback — anything not /api, not a static file, forwards to index.html
        registry.addViewController("/{path:^(?!api|actuator).*$}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{path:^(?!api|actuator).*$}/{*subpath}")
                .setViewName("forward:/index.html");
    }
}
