package com.gramacare.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Enable CORS
            .cors(cors -> {})

            // Disable CSRF for REST API
            .csrf(csrf -> csrf.disable())

            // Allow API requests
            .authorizeHttpRequests(auth -> auth

                // Allow browser preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Login and Register
                .requestMatchers(
                    "/api/users/login",
                    "/api/users/register"
                ).permitAll()

                // Allow all other APIs for now
                .anyRequest().permitAll()
            );

        return http.build();
    }
}