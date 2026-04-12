package com.stock.authservice.controller;

import com.stock.authservice.dto.request.AuditEventRequest;
import com.stock.authservice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoint for receiving audit events from other microservices.
 * Protected by a shared service key (X-Service-Key header) rather than user JWT,
 * so any authenticated service can log events regardless of role.
 */
@RestController
@RequestMapping("/internal/audit")
@RequiredArgsConstructor
@Slf4j
public class AuditIngestController {

    private static final String SERVICE_KEY = "stockflow-service-2024";

    private final AuditLogService auditLogService;

    @PostMapping("/log")
    public ResponseEntity<Void> ingestEvent(
            @RequestHeader(value = "X-Service-Key", required = false) String serviceKey,
            @RequestBody AuditEventRequest request) {

        if (!SERVICE_KEY.equals(serviceKey)) {
            log.warn("Rejected audit ingest — invalid or missing X-Service-Key");
            return ResponseEntity.status(403).build();
        }

        auditLogService.logExternalEvent(request);
        return ResponseEntity.ok().build();
    }
}
