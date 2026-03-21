package com.stock.authservice.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@Getter
@Slf4j
public class JwtConfig {

    @Value("${jwt.issuer:auth-service}")
    private String issuer;

    @Value("${jwt.access-token-expiration:900000}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private Long refreshTokenExpiration;

    @Value("${jwt.mfa-temp-token-expiration:300000}")
    private Long mfaTempTokenExpiration;

    @Value("${jwt.private-key-path:keys/private_key.pem}")
    private String privateKeyPath;

    @Value("${jwt.public-key-path:keys/public_key.pem}")
    private String publicKeyPath;

    private PrivateKey privateKey;
    private PublicKey publicKey;

    @PostConstruct
    public void init() {
        try {
            log.info("Loading RSA keys...");
            this.privateKey = loadPrivateKey();
            this.publicKey = loadPublicKey();
            log.info("✅ RSA keys loaded successfully");
            log.info("Private key algorithm: {}", privateKey.getAlgorithm());
            log.info("Public key algorithm: {}", publicKey.getAlgorithm());
        } catch (Exception e) {
            log.error("❌ Failed to load RSA keys", e);
            throw new RuntimeException("Failed to load RSA keys", e);
        }
    }

    private PrivateKey loadPrivateKey() throws Exception {
        log.debug("Loading private key from: {}", privateKeyPath);

        ClassPathResource resource = new ClassPathResource(privateKeyPath);
        String key = new String(resource.getInputStream().readAllBytes());

        // Remove PEM headers/footers and whitespace
        String privateKeyPEM = key
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        // Decode Base64
        byte[] decoded = Base64.getDecoder().decode(privateKeyPEM);

        // Generate private key
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return keyFactory.generatePrivate(keySpec);
    }

    private PublicKey loadPublicKey() throws Exception {
        log.debug("Loading public key from: {}", publicKeyPath);

        ClassPathResource resource = new ClassPathResource(publicKeyPath);
        String key = new String(resource.getInputStream().readAllBytes());

        // Remove PEM headers/footers and whitespace
        String publicKeyPEM = key
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        // Decode Base64
        byte[] decoded = Base64.getDecoder().decode(publicKeyPEM);

        // Generate public key
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return keyFactory.generatePublic(keySpec);
    }

    // Deprecated - kept for backward compatibility but not used anymore
    @Deprecated
    public String getSecret() {
        log.warn("getSecret() is deprecated. Using RSA keys instead.");
        return null;
    }
}
