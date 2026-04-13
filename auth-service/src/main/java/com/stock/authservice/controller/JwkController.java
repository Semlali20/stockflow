package com.stock.authservice.controller;

import com.stock.authservice.dto.response.JwkResponse;
import com.stock.authservice.service.JwkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "JWK", description = "JSON Web Key Set endpoints for public key distribution")
public class JwkController {

    private final JwkService jwkService;

    @GetMapping("/.well-known/jwks.json")
    @Operation(
            summary = "Get JWK Set",
            description = "Returns the JSON Web Key Set containing the public keys used to verify JWT signatures"
    )
    public ResponseEntity<JwkResponse> getJwks() {
        log.info("GET /.well-known/jwks.json - JWK Set requested");

        JwkResponse jwkResponse = jwkService.getJwks();

        return ResponseEntity.ok(jwkResponse);
    }
}
