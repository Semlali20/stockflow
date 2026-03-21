package com.stock.authservice.controller;

import com.stock.authservice.dto.response.ApiResponse;
import com.stock.authservice.dto.response.SessionResponse;
import com.stock.authservice.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Session Management", description = "User session management")
@SecurityRequirement(name = "Bearer Authentication")
public class SessionController {

    private final SessionService sessionService;

    // ==================== GET USER SESSIONS ====================

    @GetMapping("/me")
    @Operation(summary = "Get my sessions", description = "Get all sessions for current user")
    public ResponseEntity<List<SessionResponse>> getMyActiveSessions(Authentication authentication) {
        log.info("GET /api/sessions/me - Get sessions for current user");

        String userId = ((com.stock.authservice.security.CustomUserDetails) authentication.getPrincipal()).getId();
        List<SessionResponse> response = sessionService.getUserSessions(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/active")
    @Operation(summary = "Get my active sessions", description = "Get active sessions for current user")
    public ResponseEntity<List<SessionResponse>> getMyActiveSessions2(Authentication authentication) {
        log.info("GET /api/sessions/me/active - Get active sessions for current user");

        String userId = ((com.stock.authservice.security.CustomUserDetails) authentication.getPrincipal()).getId();
        List<SessionResponse> response = sessionService.getActiveSessions(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Get user sessions", description = "Get all sessions for specific user")
    public ResponseEntity<List<SessionResponse>> getUserSessions(@PathVariable String userId) {
        log.info("GET /api/sessions/user/{} - Get sessions for user", userId);

        List<SessionResponse> response = sessionService.getUserSessions(userId);

        return ResponseEntity.ok(response);
    }

    // ==================== TERMINATE SESSION ====================

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasRole('ADMIN') or @sessionService.isSessionOwner(#sessionId, authentication.principal.id)")
    @Operation(summary = "Terminate session", description = "Terminate a specific session")
    public ResponseEntity<ApiResponse<Void>> terminateSession(@PathVariable String sessionId) {
        log.info("DELETE /api/sessions/{} - Terminate session", sessionId);

        sessionService.terminateSession(sessionId, "USER_TERMINATED");

        return ResponseEntity.ok(ApiResponse.success("Session terminated successfully", null));
    }

    @DeleteMapping("/user/{userId}/all")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Terminate all user sessions", description = "Terminate all sessions for specific user")
    public ResponseEntity<ApiResponse<Void>> terminateAllUserSessions(@PathVariable String userId) {
        log.info("DELETE /api/sessions/user/{}/all - Terminate all sessions for user", userId);

        sessionService.terminateUserSessions(userId, "USER_TERMINATED_ALL");

        return ResponseEntity.ok(ApiResponse.success("All sessions terminated successfully", null));
    }
}
