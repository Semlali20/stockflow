package com.stock.authservice.service;

import com.stock.authservice.dto.response.AuditLogResponse;
import com.stock.authservice.dto.response.PageResponse;
import com.stock.authservice.entity.AuditLog;
import com.stock.authservice.exception.ResourceNotFoundException;
import com.stock.authservice.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    // ==================== LOG ACTIONS ====================

    @Transactional
    public void logSuccessfulLogin(String userId, String username, String ipAddress) {
        AuditLog auditLog = AuditLog.success(userId, username, "LOGIN", ipAddress);
        auditLogRepository.save(auditLog);
        log.debug("Logged successful login for user: {}", username);
    }

    @Transactional
    public void logFailedLogin(String username, String ipAddress, String errorMessage) {
        AuditLog auditLog = AuditLog.failure(null, username, "LOGIN_FAILED", ipAddress, errorMessage);
        auditLogRepository.save(auditLog);
        log.debug("Logged failed login for user: {}", username);
    }

    @Transactional
    public void logLogout(String userId, String username, String ipAddress) {
        AuditLog auditLog = AuditLog.success(userId, username, "LOGOUT", ipAddress);
        auditLogRepository.save(auditLog);
        log.debug("Logged logout for user: {}", username);
    }

    @Transactional
    public void logPasswordChange(String userId, String username, String ipAddress) {
        AuditLog auditLog = AuditLog.success(userId, username, "PASSWORD_CHANGE", ipAddress);
        auditLogRepository.save(auditLog);
        log.debug("Logged password change for user: {}", username);
    }

    @Transactional
    public void logAction(String userId, String username, String action, String ipAddress) {
        AuditLog auditLog = AuditLog.success(userId, username, action, ipAddress);
        auditLogRepository.save(auditLog);
        log.debug("Logged action {} for user: {}", action, username);
    }

    // ==================== GET AUDIT LOGS ====================

    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(String id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog", "id", id));
        return mapToResponse(auditLog);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAllAuditLogs(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<AuditLog> auditLogPage = auditLogRepository.findAll(pageable);

        return mapToPageResponse(auditLogPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsByUserId(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<AuditLog> auditLogs = auditLogRepository.findByUserId(userId);

        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsByUsername(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<AuditLog> auditLogs = auditLogRepository.findByUserId(username); // Assuming username query

        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsByAction(String action, int page, int size) {
        List<AuditLog> auditLogs = auditLogRepository.findByAction(action);
        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsByDateRange(
            LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        List<AuditLog> auditLogs = auditLogRepository.findByTimestampBetween(startDate, endDate);
        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsByIpAddress(String ipAddress, int page, int size) {
        List<AuditLog> auditLogs = auditLogRepository.findAll().stream()
                .filter(log -> ipAddress.equals(log.getIpAddress()))
                .collect(Collectors.toList());
        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsByStatus(String status, int page, int size) {
        List<AuditLog> auditLogs = auditLogRepository.findAll().stream()
                .filter(log -> status.equals(log.getStatus()))
                .collect(Collectors.toList());
        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getFailedLoginAttempts(int page, int size) {
        List<AuditLog> auditLogs = auditLogRepository.findByAction("LOGIN_FAILED");
        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getSecurityEvents(int page, int size) {
        List<String> securityActions = List.of(
                "ACCOUNT_LOCKED", "ACCOUNT_UNLOCKED", "PASSWORD_CHANGE",
                "PASSWORD_RESET", "MFA_ENABLED", "MFA_DISABLED"
        );

        List<AuditLog> auditLogs = auditLogRepository.findAll().stream()
                .filter(log -> securityActions.contains(log.getAction()))
                .collect(Collectors.toList());

        return createPageResponse(auditLogs, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> searchAuditLogs(
            String userId, String username, String action, String status,
            String ipAddress, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size) {

        List<AuditLog> auditLogs = auditLogRepository.findAll().stream()
                .filter(log -> userId == null || userId.equals(log.getUserId()))
                .filter(log -> username == null || username.equals(log.getUsername()))
                .filter(log -> action == null || action.equals(log.getAction()))
                .filter(log -> status == null || status.equals(log.getStatus()))
                .filter(log -> ipAddress == null || ipAddress.equals(log.getIpAddress()))
                .filter(log -> startDate == null || !log.getTimestamp().isBefore(startDate))
                .filter(log -> endDate == null || !log.getTimestamp().isAfter(endDate))
                .collect(Collectors.toList());

        return createPageResponse(auditLogs, page, size);
    }

    // ==================== HELPER METHODS ====================

    private AuditLogResponse mapToResponse(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUserId())
                .username(auditLog.getUsername())
                .action(auditLog.getAction())
                .resourceType(auditLog.getResourceType())
                .resourceId(auditLog.getResourceId())
                .ipAddress(auditLog.getIpAddress())
                .userAgent(auditLog.getUserAgent())
                .status(auditLog.getStatus())
                .errorMessage(auditLog.getErrorMessage())
                .details(auditLog.getDetails())
                .timestamp(auditLog.getTimestamp())
                .build();
    }

    private PageResponse<AuditLogResponse> mapToPageResponse(Page<AuditLog> page) {
        List<AuditLogResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<AuditLogResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    private PageResponse<AuditLogResponse> createPageResponse(List<AuditLog> auditLogs, int page, int size) {
        int start = page * size;
        int end = Math.min(start + size, auditLogs.size());

        List<AuditLogResponse> content = auditLogs.subList(start, end).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<AuditLogResponse>builder()
                .content(content)
                .pageNumber(page)
                .pageSize(size)
                .totalElements((long) auditLogs.size())
                .totalPages((int) Math.ceil((double) auditLogs.size() / size))
                .isLast(end >= auditLogs.size())
                .build();
    }
}
