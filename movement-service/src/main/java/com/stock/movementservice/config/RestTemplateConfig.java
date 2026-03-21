package com.stock.movementservice.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * 🔥 Configuration for RestTemplate (for inter-service communication)
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Create RestTemplate bean for HTTP communication between services
     *
     * @param builder RestTemplateBuilder provided by Spring Boot
     * @return Configured RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))  // Connection timeout
                .setReadTimeout(Duration.ofSeconds(10))    // Read timeout
                .build();
    }
}
