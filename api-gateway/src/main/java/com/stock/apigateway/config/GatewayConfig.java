package com.stock.apigateway.config;

import com.stock.apigateway.filter.JwtAuthenticationFilter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private KeyResolver ipKeyResolver;

    @Autowired
    @Qualifier("authRateLimiter")
    private RedisRateLimiter authRateLimiter;

    @Autowired
    @Qualifier("apiRateLimiter")
    private RedisRateLimiter apiRateLimiter;

    @Value("${services.auth-service.url}")
    private String authServiceUrl;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    @Value("${services.inventory-service.url}")
    private String inventoryServiceUrl;

    @Value("${services.movement-service.url}")
    private String movementServiceUrl;

    @Value("${services.location-service.url}")
    private String locationServiceUrl;

    @Value("${services.alert-service.url}")
    private String alertServiceUrl;

    @Value("${services.purchase-service.url}")
    private String purchaseServiceUrl;

    @Value("${services.sales-service.url}")
    private String salesServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // Auth Service — public endpoints (login, register, etc.)
                // Strict: 5 req/s per IP, burst 10
                .route("auth-service-public", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(authRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(authServiceUrl))

                // Auth Service — user management (JWT required)
                .route("auth-service-users", r -> r
                        .path("/api/users/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(authServiceUrl))

                // Auth Service — audit logs (JWT required)
                .route("auth-service-audit", r -> r
                        .path("/api/audit/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(authServiceUrl))

                // Auth Service — roles (JWT required)
                .route("auth-service-roles", r -> r
                        .path("/api/roles/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(authServiceUrl))

                // Auth Service — permissions (JWT required)
                .route("auth-service-permissions", r -> r
                        .path("/api/permissions/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(authServiceUrl))

                // Product Service
                .route("product-service", r -> r
                        .path("/api/item-variants/**", "/api/categories/**", "/api/items/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(productServiceUrl))

                // Inventory Service
                .route("inventory-service", r -> r
                        .path("/api/inventory/**", "/api/lots/**", "/api/serials/**", "/api/v1/admin/cache/items/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(inventoryServiceUrl))

                // Movement Service — JWT + X-User-Id header injection
                .route("movement-service", r -> r
                        .path("/api/movement-tasks/**", "/api/movement-lines/**", "/api/movements/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .filter((exchange, chain) -> {
                                    try {
                                        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                                            String jwt = authHeader.substring(7);
                                            Claims claims = Jwts.parser()
                                                    .verifyWith(getPublicKey())
                                                    .build()
                                                    .parseSignedClaims(jwt)
                                                    .getPayload();
                                            String userId = claims.get("userId", String.class);
                                            if (userId != null) {
                                                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                                                        .header("X-User-Id", userId)
                                                        .build();
                                                return chain.filter(exchange.mutate().request(modifiedRequest).build());
                                            }
                                        }
                                    } catch (Exception e) {
                                        // Continue without the header on error
                                    }
                                    return chain.filter(exchange);
                                })
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(movementServiceUrl))

                // Location Service
                .route("location-service", r -> r
                        .path("/api/locations/**", "/api/sites/**", "/api/warehouses/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(locationServiceUrl))

                // Alert Service
                .route("alert-service", r -> r
                        .path("/api/alerts/**", "/api/notifications/**", "/api/notification-channels/**",
                              "/api/notification-templates/**", "/api/rules/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(alertServiceUrl))

                // Purchase Service
                .route("purchase-service", r -> r
                        .path("/api/suppliers/**", "/api/purchase-orders/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(purchaseServiceUrl))

                // Sales Service
                .route("sales-service", r -> r
                        .path("/api/customers/**", "/api/quotes/**", "/api/delivery-notes/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config()))
                                .requestRateLimiter(c -> c
                                        .setRateLimiter(apiRateLimiter)
                                        .setKeyResolver(ipKeyResolver)
                                ))
                        .uri(salesServiceUrl))

                .build();
    }

    private PublicKey getPublicKey() throws Exception {
        String n = "zzxT2R2l-vnLM4Tmcj8yyukMh7bML0V_82tsB39BKomsoPsrCm05xXppVwyIUuBnS-5tmHAUD_Vc0cDocCRzX_eZ8dWMq5SXAUJRdxVBndFTtK4VC1Hou5JtwrqHFkThtsEBxbGe6zBr-BMsfHnaVQNZa75SWN5xbhTuUnXDF5k36bVwM51mlzoMVDWN6kTFvZ1YibZTORSny3ExwlZvse_vf9-ZsRhDoZYDSOtHHnWK_WQqcmiid2DHdbzDYPGggVLuRQTtvTGmd5K18eGU7zYOiNeeWX45uTS9s6_ozGQnbWYGD4gsaKueWcvL_K1swaCEkyPscFsTf6wfAKFWSQ";
        String e = "AQAB";

        byte[] nBytes = Base64.getUrlDecoder().decode(n);
        byte[] eBytes = Base64.getUrlDecoder().decode(e);

        BigInteger modulus = new BigInteger(1, nBytes);
        BigInteger exponent = new BigInteger(1, eBytes);

        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        return factory.generatePublic(spec);
    }
}
