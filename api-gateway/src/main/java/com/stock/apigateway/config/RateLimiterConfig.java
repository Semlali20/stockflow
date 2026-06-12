package com.stock.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    // Use client IP as the rate limit key.
    // Respects X-Forwarded-For when the gateway is behind a reverse proxy.
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return Mono.just(forwarded.split(",")[0].trim());
            }
            return Mono.just(
                exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                    : "unknown"
            );
        };
    }

    // Strict limiter for public auth endpoints (login, register).
    // 5 requests/second per IP, burst up to 10.
    @Bean
    public RedisRateLimiter authRateLimiter() {
        return new RedisRateLimiter(5, 10, 1);
    }

    // Standard limiter for all authenticated API endpoints.
    // 30 requests/second per IP, burst up to 60.
    @Bean
    public RedisRateLimiter apiRateLimiter() {
        return new RedisRateLimiter(30, 60, 1);
    }
}
