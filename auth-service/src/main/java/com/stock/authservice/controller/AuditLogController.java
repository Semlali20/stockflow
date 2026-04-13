package com.stock.authservice.controller;

import com.stock.authservice.dto.response.AuditLogResponse;
import com.stock.authservice.dto.response.PageResponse;
import com.stock.authservice.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit Logs", description = "Audit log management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    // ==================== GET AUDIT LOGS ====================

    @GetMapping
    @Operation(summary = "Get all audit logs", description = "Get paginated list of all audit logs")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("GET /api/audit - Get all audit logs - page: {}, size: {}", page, size);

        PageResponse<AuditLogResponse> response = auditLogService.getAllAuditLogs(page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get audit log by ID", description = "Get audit log details by ID")
    public ResponseEntity<AuditLogResponse> getAuditLogById(@PathVariable String id) {
        log.info("GET /api/audit/{} - Get audit log by ID", id);

        AuditLogResponse response = auditLogService.getAuditLogById(id);

        return ResponseEntity.ok(response);
    }

    // ==================== GET AUDIT LOGS BY USER ====================

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get audit logs by user", description = "Get all audit logs for a specific user")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/user/{} - Get audit logs for user", userId);

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogsByUserId(userId, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Get audit logs by username", description = "Get all audit logs for a specific username")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogsByUsername(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/username/{} - Get audit logs for username", username);

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogsByUsername(username, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== GET AUDIT LOGS BY ACTION ====================

    @GetMapping("/action/{action}")
    @Operation(summary = "Get audit logs by action", description = "Get all audit logs for a specific action")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogsByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/action/{} - Get audit logs by action", action);

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogsByAction(action, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== GET AUDIT LOGS BY DATE RANGE ====================

    @GetMapping("/date-range")
    @Operation(summary = "Get audit logs by date range", description = "Get audit logs within a specific date range")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/date-range - Get audit logs from {} to {}", startDate, endDate);

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogsByDateRange(
                startDate, endDate, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== GET AUDIT LOGS BY IP ADDRESS ====================

    @GetMapping("/ip/{ipAddress}")
    @Operation(summary = "Get audit logs by IP address", description = "Get all audit logs from a specific IP address")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogsByIpAddress(
            @PathVariable String ipAddress,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/ip/{} - Get audit logs by IP address", ipAddress);

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogsByIpAddress(ipAddress, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== GET AUDIT LOGS BY STATUS ====================

    @GetMapping("/status/{status}")
    @Operation(summary = "Get audit logs by status", description = "Get all audit logs with a specific status (SUCCESS/FAILURE)")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/status/{} - Get audit logs by status", status);

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogsByStatus(status, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== GET FAILED LOGIN ATTEMPTS ====================

    @GetMapping("/failed-logins")
    @Operation(summary = "Get failed login attempts", description = "Get all failed login attempts")
    public ResponseEntity<PageResponse<AuditLogResponse>> getFailedLoginAttempts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/failed-logins - Get failed login attempts");

        PageResponse<AuditLogResponse> response = auditLogService.getFailedLoginAttempts(page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== GET SECURITY EVENTS ====================

    @GetMapping("/security-events")
    @Operation(summary = "Get security events", description = "Get security-related events (locks, unlocks, password changes)")
    public ResponseEntity<PageResponse<AuditLogResponse>> getSecurityEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/security-events - Get security events");

        PageResponse<AuditLogResponse> response = auditLogService.getSecurityEvents(page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== SEARCH AUDIT LOGS ====================

    @GetMapping("/search")
    @Operation(summary = "Search audit logs", description = "Search audit logs with multiple filters")
    public ResponseEntity<PageResponse<AuditLogResponse>> searchAuditLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/audit/search - Search audit logs with filters");

        PageResponse<AuditLogResponse> response = auditLogService.searchAuditLogs(
                userId, username, action, status, ipAddress, startDate, endDate, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== STATISTICS ====================

    @GetMapping("/stats/by-action")
    @Operation(summary = "Get audit statistics by action", description = "Get count of audit logs grouped by action")
    public ResponseEntity<?> getStatsByAction() {
        log.info("GET /api/audit/stats/by-action - Get statistics by action");

        // TODO: Implement statistics aggregation
        return ResponseEntity.ok("Statistics feature coming soon");
    }

    @GetMapping("/stats/by-user")
    @Operation(summary = "Get audit statistics by user", description = "Get count of audit logs grouped by user")
    public ResponseEntity<?> getStatsByUser() {
        log.info("GET /api/audit/stats/by-user - Get statistics by user");

        // TODO: Implement statistics aggregation
        return ResponseEntity.ok("Statistics feature coming soon");
    }
}
