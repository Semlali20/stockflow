package com.stock.authservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwkKey {

    @JsonProperty("kty")
    private String keyType;          // "RSA"

    @JsonProperty("use")
    private String publicKeyUse;     // "sig" (signature)

    @JsonProperty("kid")
    private String keyId;            // Key ID

    @JsonProperty("alg")
    private String algorithm;        // "RS256"

    @JsonProperty("n")
    private String modulus;          // RSA public key modulus (Base64URL encoded)

    @JsonProperty("e")
    private String exponent;         // RSA public key exponent (Base64URL encoded)
}
