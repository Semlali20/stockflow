package com.stock.authservice.service;

import com.stock.authservice.constants.SecurityConstants;
import com.stock.authservice.dto.response.SessionResponse;
import com.stock.authservice.entity.User;
import com.stock.authservice.entity.UserSession;
import com.stock.authservice.event.AuthEventPublisher;
import com.stock.authservice.event.dto.SessionCreatedEvent;
import com.stock.authservice.event.dto.SessionTerminatedEvent;
import com.stock.authservice.exception.ResourceNotFoundException;
import com.stock.authservice.repository.UserSessionRepository;
import com.stock.authservice.util.DateTimeUtil;
import com.stock.authservice.util.RandomTokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final UserSessionRepository sessionRepository;
    private final AuthEventPublisher authEventPublisher;

    // ==================== CREATE SESSION ====================

    @Transactional
    public UserSession createSession(User user, String accessToken, String ipAddress, String userAgent, String deviceType) {
        log.info("Creating session for user: {}", user.getUsername());

        // Check max concurrent sessions
        List<UserSession> activeSessions = sessionRepository.findByUserIdAndIsActive(user.getId(), true);
        if (activeSessions.size() >= SecurityConstants.MAX_CONCURRENT_SESSIONS) {
            // Terminate oldest session
            UserSession oldestSession = activeSessions.stream()
                    .min((s1, s2) -> s1.getCreatedAt().compareTo(s2.getCreatedAt()))
                    .orElse(null);

            if (oldestSession != null) {
                log.info("Max concurrent sessions reached. Terminating oldest session: {}", oldestSession.getId());
                terminateSession(oldestSession.getId(), "MAX_SESSIONS_EXCEEDED");
            }
        }

        String sessionToken = RandomTokenGenerator.generateSessionToken();

        UserSession session = UserSession.builder()
                .sessionToken(sessionToken)
                .userId(user.getId())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .deviceType(deviceType)
                .isActive(true)
                .lastActivity(LocalDateTime.now())
                .expiresAt(DateTimeUtil.addMinutes(LocalDateTime.now(), SecurityConstants.SESSION_INACTIVITY_TIMEOUT_MINUTES))
                .build();

        session = sessionRepository.save(session);

        // Publish event
        authEventPublisher.publishSessionCreated(SessionCreatedEvent.builder()
                .sessionId(session.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .deviceType(deviceType)
                .createdAt(LocalDateTime.now())
                .expiresAt(session.getExpiresAt())
                .build());

        log.info("Session created successfully for user: {} with session ID: {}", user.getUsername(), session.getId());
        return session;
    }

    // ==================== UPDATE SESSION ACTIVITY ====================

    @Transactional
    public void updateSessionActivity(String sessionId) {
        log.debug("Updating session activity for session: {}", sessionId);

        sessionRepository.findById(sessionId).ifPresent(session -> {
            if (session.getIsActive() && !session.isExpired()) {
                session.setLastActivity(LocalDateTime.now());
                session.setExpiresAt(DateTimeUtil.addMinutes(LocalDateTime.now(),
                        SecurityConstants.SESSION_INACTIVITY_TIMEOUT_MINUTES));
                sessionRepository.save(session);
                log.debug("Session activity updated for session: {}", sessionId);
            } else {
                log.warn("Attempted to update inactive or expired session: {}", sessionId);
            }
        });
    }

    @Transactional
    public void updateSessionActivityByToken(String sessionToken) {
        log.debug("Updating session activity by token");

        sessionRepository.findBySessionToken(sessionToken).ifPresent(session -> {
            if (session.getIsActive() && !session.isExpired()) {
                session.setLastActivity(LocalDateTime.now());
                session.setExpiresAt(DateTimeUtil.addMinutes(LocalDateTime.now(),
                        SecurityConstants.SESSION_INACTIVITY_TIMEOUT_MINUTES));
                sessionRepository.save(session);
                log.debug("Session activity updated for session: {}", session.getId());
            }
        });
    }

    // ==================== TERMINATE SESSION ====================

    @Transactional
    public void terminateSession(String sessionId, String reason) {
        log.info("Terminating session: {} - Reason: {}", sessionId, reason);

        UserSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        if (!session.getIsActive()) {
            log.warn("Attempted to terminate already inactive session: {}", sessionId);
            return;
        }

        session.terminate(reason);
        sessionRepository.save(session);

        // Publish event
        authEventPublisher.publishSessionTerminated(SessionTerminatedEvent.builder()
                .sessionId(session.getId())
                .userId(session.getUserId())
                .username(session.getUser() != null ? session.getUser().getUsername() : "unknown")
                .terminatedAt(LocalDateTime.now())
                .reason(reason)
                .build());

        log.info("Session terminated successfully: {}", sessionId);
    }

    @Transactional
    public void terminateSessionByToken(String sessionToken, String reason) {
        log.info("Terminating session by token - Reason: {}", reason);

        sessionRepository.findBySessionToken(sessionToken).ifPresent(session -> {
            terminateSession(session.getId(), reason);
        });
    }

    @Transactional
    public void terminateAllUserSessions(String userId, String reason) {
        log.info("Terminating all sessions for user: {} - Reason: {}", userId, reason);

        List<UserSession> activeSessions = sessionRepository.findByUserIdAndIsActive(userId, true);

        activeSessions.forEach(session -> terminateSession(session.getId(), reason));

        log.info("Terminated {} active sessions for user: {}", activeSessions.size(), userId);
    }

    @Transactional
    public void terminateUserSessions(String userId, String userTerminatedAll) {
        terminateAllUserSessions(userId, "ADMIN_ACTION");
    }

    // ==================== GET SESSION INFO ====================

    @Transactional(readOnly = true)
    public SessionResponse getSessionById(String sessionId) {
        log.debug("Getting session by ID: {}", sessionId);

        UserSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        return mapToSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public SessionResponse getSessionByToken(String sessionToken) {
        log.debug("Getting session by token");

        UserSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "token", "***"));

        return mapToSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getUserSessions(String userId) {
        log.debug("Getting all sessions for user: {}", userId);

        List<UserSession> sessions = sessionRepository.findByUserId(userId);

        return sessions.stream()
                .map(this::mapToSessionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions(String userId) {
        log.debug("Getting active sessions for user: {}", userId);

        List<UserSession> sessions = sessionRepository.findActiveSessionsByUserId(userId, LocalDateTime.now());

        return sessions.stream()
                .map(this::mapToSessionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getAllActiveSessions() {
        log.debug("Getting all active sessions");

        List<UserSession> sessions = sessionRepository.findByUserIdAndIsActive(null, true);

        return sessions.stream()
                .filter(session -> !session.isExpired())
                .map(this::mapToSessionResponse)
                .collect(Collectors.toList());
    }

    // ==================== SESSION VALIDATION ====================

    @Transactional(readOnly = true)
    public boolean isSessionValid(String sessionId) {
        return sessionRepository.findById(sessionId)
                .map(UserSession::isValid)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isSessionOwner(String sessionId, String userId) {
        return sessionRepository.findById(sessionId)
                .map(session -> session.getUserId().equals(userId))
                .orElse(false);
    }

    // ==================== SESSION CLEANUP ====================

    @Transactional
    public void cleanupExpiredSessions() {
        log.info("Cleaning up expired sessions");

        LocalDateTime now = LocalDateTime.now();
        List<UserSession> expiredSessions = sessionRepository.findByUserIdAndIsActive(null, true).stream()
                .filter(session -> session.getExpiresAt().isBefore(now))
                .collect(Collectors.toList());

        expiredSessions.forEach(session -> {
            session.terminate("SESSION_EXPIRED");
            sessionRepository.save(session);
            log.debug("Expired session terminated: {}", session.getId());
        });

        log.info("Cleaned up {} expired sessions", expiredSessions.size());
    }

    @Transactional
    public void deleteOldSessions(int daysOld) {
        log.info("Deleting sessions older than {} days", daysOld);

        LocalDateTime threshold = LocalDateTime.now().minusDays(daysOld);
        sessionRepository.deleteExpiredSessions(threshold);

        log.info("Old sessions deleted successfully");
    }

    // ==================== SESSION STATISTICS ====================

    @Transactional(readOnly = true)
    public long countActiveSessions() {
        return sessionRepository.findByUserIdAndIsActive(null, true).stream()
                .filter(session -> !session.isExpired())
                .count();
    }

    @Transactional(readOnly = true)
    public long countUserActiveSessions(String userId) {
        return sessionRepository.findActiveSessionsByUserId(userId, LocalDateTime.now()).size();
    }

    @Transactional(readOnly = true)
    public long countTotalSessions() {
        return sessionRepository.count();
    }

    // ==================== HELPER METHODS ====================

    private SessionResponse mapToSessionResponse(UserSession session) {
        return SessionResponse.builder()
                .id(session.getId())
                .sessionToken(session.getSessionToken())
                .ipAddress(session.getIpAddress())
                .userAgent(session.getUserAgent())
                .deviceType(session.getDeviceType())
                .isActive(session.getIsActive())
                .lastActivity(session.getLastActivity())
                .expiresAt(session.getExpiresAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
