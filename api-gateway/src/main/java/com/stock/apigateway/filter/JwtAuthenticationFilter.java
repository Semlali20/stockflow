package com.stock.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Component
@Slf4j
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${jwt.jwks-url}")
    private String jwksUrl;

    private PublicKey publicKey;

    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify-email",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/refresh",
            "/actuator",
            "/health"
    );

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @PostConstruct
    public void init() {
        try {
            log.info("Loading public key from JWKS");
            this.publicKey = loadPublicKeyFromJwks();
            log.info("Public key loaded successfully");
        } catch (Exception e) {
            log.error("Failed to load public key from JWKS", e);
        }
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().value();

            log.debug("Processing request for path: {}", path);

            if (isPublicEndpoint(path)) {
                log.debug("Public endpoint, skipping JWT validation: {}", path);
                return chain.filter(exchange);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("Missing or invalid Authorization header");
                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String jwt = authHeader.substring(7);

            try {
                // Using the parser() method which works with older JWT versions
                Claims claims = Jwts.parser()
                        .verifyWith(publicKey)  // 1. Changed method name
                        .build()
                        .parseSignedClaims(jwt)  // 2. Changed method name
                        .getPayload();

                String username = claims.getSubject();
                log.debug("JWT validated successfully for user: {}", username);

                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", username)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception ex) {
                log.error("JWT validation failed: {}", ex.getMessage());
                return onError(exchange, "JWT validation failed", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean isPublicEndpoint(String path) {
        for (String publicPath : PUBLIC_ENDPOINTS) {
            if (path.startsWith(publicPath)) {
                return true;
            }
        }
        return false;
    }

    private PublicKey loadPublicKeyFromJwks() throws Exception {
        // Hardcoded values from your JWKS response
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

    private Mono<Void> onError(ServerWebExchange exchange, String errorMessage, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String errorResponse = String.format(
                "{\"error\": \"%s\", \"message\": \"%s\", \"status\": %d}",
                httpStatus.getReasonPhrase(),
                errorMessage,
                httpStatus.value()
        );

        byte[] bytes = errorResponse.getBytes(StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

    public static class Config {
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}
