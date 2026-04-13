package com.stock.authservice.service;

import com.stock.authservice.config.JwtConfig;
import com.stock.authservice.dto.response.JwkKey;
import com.stock.authservice.dto.response.JwkResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwkService {

    private final JwtConfig jwtConfig;

    /**
     * Generate JWK Set (JSON Web Key Set) for public key distribution
     */
    public JwkResponse getJwks() {
        log.debug("Generating JWK Set");

        RSAPublicKey publicKey = (RSAPublicKey) jwtConfig.getPublicKey();

        // Convert RSA modulus and exponent to Base64URL format
        String modulus = base64UrlEncode(publicKey.getModulus().toByteArray());
        String exponent = base64UrlEncode(publicKey.getPublicExponent().toByteArray());

        JwkKey jwkKey = JwkKey.builder()
                .keyType("RSA")
                .publicKeyUse("sig")
                .keyId("auth-service-key-1")  // You can make this dynamic/configurable
                .algorithm("RS256")
                .modulus(modulus)
                .exponent(exponent)
                .build();

        log.debug("JWK Set generated successfully");

        return JwkResponse.builder()
                .keys(Collections.singletonList(jwkKey))
                .build();
    }

    /**
     * Convert byte array to Base64URL encoded string
     * (removes padding and replaces + and / characters)
     */
    private String base64UrlEncode(byte[] data) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(removeLeadingZeros(data));
    }

    /**
     * Remove leading zero bytes from the byte array
     * (required for proper JWK format)
     */
    private byte[] removeLeadingZeros(byte[] data) {
        int start = 0;
        while (start < data.length && data[start] == 0) {
            start++;
        }

        if (start == 0) {
            return data;
        }

        byte[] result = new byte[data.length - start];
        System.arraycopy(data, start, result, 0, result.length);
        return result;
    }
}
