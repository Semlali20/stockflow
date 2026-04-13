package com.stock.authservice.security;

import com.stock.authservice.config.JwtConfig;
import com.stock.authservice.exception.TokenInvalidException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;

    // ==================== GENERATE ACCESS TOKEN (RS256) ====================

    public String generateAccessToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getAccessTokenExpiration());

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getId());
        claims.put("username", userDetails.getUsername());
        claims.put("email", userDetails.getEmail());
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        log.debug("Generating access token for user: {}", userDetails.getUsername());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setIssuer(jwtConfig.getIssuer())
                .signWith(jwtConfig.getPrivateKey(), SignatureAlgorithm.RS256)  // ✅ Changed to RS256
                .compact();
    }

    // ==================== GENERATE REFRESH TOKEN (RS256) ====================

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getRefreshTokenExpiration());

        log.debug("Generating refresh token for user: {}", username);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setIssuer(jwtConfig.getIssuer())
                .claim("tokenType", "refresh")
                .signWith(jwtConfig.getPrivateKey(), SignatureAlgorithm.RS256)  // ✅ Changed to RS256
                .compact();
    }

    // ==================== GENERATE MFA TEMPORARY TOKEN (RS256) ====================

    public String generateMfaTempToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getMfaTempTokenExpiration());

        log.debug("Generating MFA temp token for user: {}", username);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setIssuer(jwtConfig.getIssuer())
                .claim("tokenType", "mfa_temp")
                .signWith(jwtConfig.getPrivateKey(), SignatureAlgorithm.RS256)  // ✅ Changed to RS256
                .compact();
    }

    // ==================== GET USERNAME FROM TOKEN ====================

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtConfig.getPublicKey())  // ✅ Use public key for verification
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // ==================== GET USER ID FROM TOKEN ====================

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtConfig.getPublicKey())  // ✅ Use public key for verification
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("userId", String.class);
    }

    // ==================== VALIDATE TOKEN ====================

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtConfig.getPublicKey())  // ✅ Use public key for verification
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
            throw new TokenInvalidException("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
            throw new TokenInvalidException("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
            throw new TokenInvalidException("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
            throw new TokenInvalidException("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
            throw new TokenInvalidException("JWT claims string is empty");
        }
    }

    // ==================== GET EXPIRATION DATE FROM TOKEN ====================

    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtConfig.getPublicKey())  // ✅ Use public key for verification
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getExpiration();
    }

    // ==================== CHECK IF TOKEN IS EXPIRED ====================

    public boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    // ==================== GET ALL CLAIMS FROM TOKEN ====================

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(jwtConfig.getPublicKey())  // ✅ Use public key for verification
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
