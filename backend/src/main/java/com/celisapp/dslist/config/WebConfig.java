package com.celisapp.dslist.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration for Angular Frontend Integration
 * 
 * Enables cross-origin requests from Angular development server (localhost:4200)
 * and production frontend domain (configured via environment variable).
 * 
 * Production: Update allowedOrigins to production Angular domain
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:4200",      // Angular dev server (ng serve default)
                "http://localhost:5173",      // Vite dev server (alternative)
                "http://localhost:3000"       // Docker frontend container
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Content-Type", "Authorization")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
