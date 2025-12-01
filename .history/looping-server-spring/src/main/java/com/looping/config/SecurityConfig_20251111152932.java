package com.looping.config;

public package com.looping.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for API endpoints
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/payments/**").permitAll() // Allow all payment endpoints
                .requestMatchers("/api/**").authenticated() // Secure other API endpoints
                .anyRequest().permitAll() // Allow other requests
            );

        return http.build();
    }
} {
    
}
