package com.gramacare.backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // =====================================================
        // ALLOWED FRONTEND ORIGINS
        // =====================================================

        configuration.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175",
                        "http://localhost:5176"
                )
        );

        // =====================================================
        // ALLOWED HTTP METHODS
        // =====================================================

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // =====================================================
        // ALLOWED HEADERS
        // =====================================================

        configuration.setAllowedHeaders(
                Arrays.asList("*")
        );

        // =====================================================
        // EXPOSE HEADERS
        // =====================================================

        configuration.setExposedHeaders(
                Arrays.asList("*")
        );

        // =====================================================
        // CREDENTIALS
        // =====================================================

        configuration.setAllowCredentials(true);

        // =====================================================
        // REGISTER CORS
        // =====================================================

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}