package com.careermovechecker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // SPA fallback moved to SpaController. View-controller `forward:` re-entered
    // the dispatcher and caused infinite request wrapping + asset paths got
    // served as HTML. Controller returns index.html bytes directly.
}
