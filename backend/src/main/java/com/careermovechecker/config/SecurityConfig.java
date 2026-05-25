package com.careermovechecker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final AdminProperties admin;

    public SecurityConfig(AdminProperties admin) {
        this.admin = admin;
    }

    @SuppressWarnings("deprecation")
    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public UserDetailsService users() {
        return new InMemoryUserDetailsManager(
                User.withUsername("admin")
                        .password(admin.getPassword())
                        .roles("ADMIN")
                        .build()
        );
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(c -> c.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/alerts/admin/**").hasRole("ADMIN")
                        .anyRequest().permitAll())
                .httpBasic(b -> {})
                .formLogin(f -> f.disable());
        return http.build();
    }
}
