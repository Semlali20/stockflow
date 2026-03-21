package com.stock.authservice.service;

import com.stock.authservice.entity.RefreshToken;
import com.stock.authservice.entity.User;
import com.stock.authservice.exception.TokenExpiredException;
import com.stock.authservice.exception.TokenInvalidException;
import com.stock.authservice.repository.RefreshTokenRepository;
import com.stock.authservice.security.JwtTokenProvider;
import com.stock.authservice.util.DateTimeUtil;
import com.stock.authservice.util.RandomTokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public RefreshToken createRefreshToken(User user, String ipAddress, String userAgent) {
        log.info("Creating refresh token for user: {}", user.getUsername());

        // Invalidate old refresh tokens for this user (optional: keep last N tokens)
        refreshTokenRepository.deleteByUserId(user.getId());

        String token = RandomTokenGenerator.generateSecureToken(64);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userId(user.getId())
                .expiresAt(DateTimeUtil.addDays(LocalDateTime.now(), 7))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .isRevoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String token) {
        log.debug("Validating refresh token");

        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenInvalidException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            throw new TokenExpiredException("Refresh token has expired");
        }

        if (refreshToken.getIsRevoked()) {
            throw new TokenInvalidException("Refresh token has been revoked");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeRefreshToken(String token) {
        log.debug("Revoking refresh token");

        refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
            refreshToken.revoke();
            refreshTokenRepository.save(refreshToken);
        });
    }

    @Transactional
    public void revokeAllUserRefreshTokens(String userId) {
        log.info("Revoking all refresh tokens for user: {}", userId);
        refreshTokenRepository.revokeAllUserTokens(userId, LocalDateTime.now());
    }

    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Cleaning up expired refresh tokens");
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}
