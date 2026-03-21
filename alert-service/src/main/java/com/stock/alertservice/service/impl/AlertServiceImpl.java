package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.request.AlertAcknowledgeRequest;
import com.stock.alertservice.dto.request.AlertFilterRequest;
import com.stock.alertservice.dto.request.AlertResolveRequest;
import com.stock.alertservice.dto.response.AlertResponse;
import com.stock.alertservice.dto.response.AlertStatisticsResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.dto.response.RuleSummaryDTO;
import com.stock.alertservice.dto.response.UserSummaryDTO;
import com.stock.alertservice.entity.Alert;
import com.stock.alertservice.entity.Rule;
import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertStatus;
import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.exception.AlertNotFoundException;
import com.stock.alertservice.exception.InvalidAlertStateException;
import com.stock.alertservice.exception.RuleNotFoundException;
import com.stock.alertservice.repository.AlertRepository;
import com.stock.alertservice.repository.RuleRepository;
import com.stock.alertservice.service.AlertService;
import com.stock.alertservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final RuleRepository ruleRepository;
    private final NotificationService notificationService;

    @Override
    public AlertResponse createAlert(
            AlertType type,
            AlertLevel level,
            String entityType,
            String entityId,
            String message,
            Map<String, Object> data,
            String ruleId) {

        log.info("Creating new alert - Type: {}, Level: {}, Entity: {}/{}",
                type, level, entityType, entityId);

        // Vérifier les alertes récurrentes
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<Alert> recurringAlerts = alertRepository.findRecurringAlerts(
                entityType, entityId, type, last24Hours);

        Integer recurringCount = recurringAlerts.size();

        // Créer l'alerte
        Alert.AlertBuilder alertBuilder = Alert.builder()
                .type(type)
                .level(level)
                .entityType(entityType)
                .entityId(entityId)
                .message(message)
                .data(data)
                .status(AlertStatus.ACTIVE)
                .acknowledged(false)
                .resolved(false)
                .escalationLevel(0)
                .recurringDailyCount(recurringCount);

        // Associer la règle si fournie
        if (ruleId != null) {
            Rule rule = ruleRepository.findById(ruleId)
                    .orElseThrow(() -> new RuleNotFoundException(ruleId));
            alertBuilder.rule(rule);

            // Incrémenter le compteur d'alertes de la règle
            rule.setTotalAlertsGenerated(rule.getTotalAlertsGenerated() + 1);
            rule.setActiveAlertsCount(rule.getActiveAlertsCount() + 1);
            ruleRepository.save(rule);
        }

        Alert alert = alertBuilder.build();
        Alert savedAlert = alertRepository.save(alert);

        log.info("Alert created successfully with ID: {}", savedAlert.getId());

        // Envoyer les notifications
        try {
            notificationService.sendNotificationForAlert(savedAlert.getId());
        } catch (Exception e) {
            log.error("Failed to send notification for alert: {}", savedAlert.getId(), e);
        }

        return mapToResponse(savedAlert);
    }

    @Override
    @Transactional(readOnly = true)
    public AlertResponse getAlertById(String id) {
        log.info("Fetching alert by ID: {}", id);

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new AlertNotFoundException(id));

        return mapToResponse(alert);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getAllAlerts(int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching all alerts - page: {}, size: {}", page, size);

        Sort sort = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Alert> alertPage = alertRepository.findAll(pageable);

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getActiveAlerts(int page, int size) {
        log.info("Fetching active alerts - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Alert> alertPage = alertRepository.findActiveAlerts(pageable);

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getUnacknowledgedAlerts(int page, int size) {
        log.info("Fetching unacknowledged alerts - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Alert> alertPage = alertRepository.findByAcknowledgedFalse(pageable);

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getAlertsByStatus(AlertStatus status, int page, int size) {
        log.info("Fetching alerts by status: {} - page: {}, size: {}", status, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Alert> alertPage = alertRepository.findByStatus(status, pageable);

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getAlertsByType(AlertType type, int page, int size) {
        log.info("Fetching alerts by type: {} - page: {}, size: {}", type, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Alert> alertPage = alertRepository.findByType(type, pageable);

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getAlertsByLevel(AlertLevel level, int page, int size) {
        log.info("Fetching alerts by level: {} - page: {}, size: {}", level, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Alert> alertPage = alertRepository.findByLevel(level, pageable);

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> getAlertsByEntity(
            String entityType,
            String entityId,
            int page,
            int size) {

        log.info("Fetching alerts by entity: {}/{} - page: {}, size: {}",
                entityType, entityId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Alert> alertPage = alertRepository.findByEntity(entityType, entityId, pageable);

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    public AlertResponse acknowledgeAlert(String id, AlertAcknowledgeRequest request) {
        log.info("Acknowledging alert: {}", id);

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new AlertNotFoundException(id));

        // Vérifier si l'alerte peut être acquittée
        if (alert.getAcknowledged()) {
            throw new InvalidAlertStateException(id, alert.getStatus().toString(), "acknowledge");
        }

        alert.setAcknowledged(true);
        alert.setRespondedAt(LocalDateTime.now());
        alert.setStatus(AlertStatus.ACKNOWLEDGED);

        if (request.getAssignedTo() != null) {
            alert.setAcknowledgedBy(request.getAssignedTo());
        }

        Alert updatedAlert = alertRepository.save(alert);
        log.info("Alert acknowledged successfully: {}", id);

        return mapToResponse(updatedAlert);
    }

    @Override
    public AlertResponse resolveAlert(String id, AlertResolveRequest request) {
        log.info("Resolving alert: {}", id);

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new AlertNotFoundException(id));

        // Vérifier si l'alerte peut être résolue
        if (alert.getResolved()) {
            throw new InvalidAlertStateException(id, alert.getStatus().toString(), "resolve");
        }

        alert.setResolved(true);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setStatus(AlertStatus.RESOLVED);

        if (request.getResolutionComment() != null) {
            Map<String, Object> data = alert.getData() != null ? alert.getData() : new HashMap<>();
            data.put("resolutionComment", request.getResolutionComment());
            data.put("actionTaken", request.getActionTaken());
            alert.setData(data);
        }

        // Décrémenter le compteur d'alertes actives de la règle
        if (alert.getRule() != null) {
            Rule rule = alert.getRule();
            rule.setActiveAlertsCount(Math.max(0, rule.getActiveAlertsCount() - 1));
            ruleRepository.save(rule);
        }

        Alert updatedAlert = alertRepository.save(alert);
        log.info("Alert resolved successfully: {}", id);

        return mapToResponse(updatedAlert);
    }

    @Override
    public AlertResponse escalateAlert(String id) {
        log.info("Escalating alert: {}", id);

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new AlertNotFoundException(id));

        // Vérifier si l'alerte peut être escaladée
        if (alert.getResolved()) {
            throw new InvalidAlertStateException(id, alert.getStatus().toString(), "escalate");
        }

        alert.setEscalationLevel(alert.getEscalationLevel() + 1);
        alert.setStatus(AlertStatus.ESCALATED);
        alert.setLastRecurrenceAt(LocalDateTime.now());

        Alert updatedAlert = alertRepository.save(alert);
        log.info("Alert escalated to level {}: {}", updatedAlert.getEscalationLevel(), id);

        // Envoyer une notification d'escalade
        try {
            notificationService.sendNotificationForAlert(updatedAlert.getId());
        } catch (Exception e) {
            log.error("Failed to send escalation notification for alert: {}", id, e);
        }

        return mapToResponse(updatedAlert);
    }

    @Override
    public void deleteAlert(String id) {
        log.info("Deleting alert: {}", id);

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new AlertNotFoundException(id));

        // Décrémenter les compteurs de la règle si nécessaire
        if (alert.getRule() != null && !alert.getResolved()) {
            Rule rule = alert.getRule();
            rule.setActiveAlertsCount(Math.max(0, rule.getActiveAlertsCount() - 1));
            ruleRepository.save(rule);
        }

        alertRepository.delete(alert);
        log.info("Alert deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> searchAlerts(AlertFilterRequest filter, int page, int size) {
        log.info("Searching alerts with filters");

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Alert> alertPage = alertRepository.searchAlerts(
                filter.getType(),
                filter.getLevel(),
                filter.getStatus(),
                filter.getEntityType(),
                filter.getEntityId(),
                filter.getAcknowledged(),
                filter.getResolved(),
                filter.getCreatedAfter(),
                filter.getCreatedBefore(),
                pageable
        );

        List<AlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, alertPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public AlertStatisticsResponse getAlertStatistics() {
        log.info("Fetching alert statistics");

        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        LocalDateTime last30Days = LocalDateTime.now().minusDays(30);

        // Statistiques par type
        List<Object[]> typeStats = alertRepository.getAlertStatisticsByType();
        Map<String, Long> alertsByType = new HashMap<>();
        typeStats.forEach(stat -> {
            alertsByType.put(stat[0].toString(), (Long) stat[1]);
        });

        // Statistiques par niveau
        List<Object[]> levelStats = alertRepository.getAlertStatisticsByLevel();
        Map<String, Long> alertsByLevel = new HashMap<>();
        levelStats.forEach(stat -> {
            alertsByLevel.put(stat[0].toString(), (Long) stat[1]);
        });

        // Statistiques par statut
        List<Object[]> statusStats = alertRepository.getAlertStatisticsByStatus();
        Map<String, Long> alertsByStatus = new HashMap<>();
        statusStats.forEach(stat -> {
            alertsByStatus.put(stat[0].toString(), (Long) stat[1]);
        });

        // Top entités alertées
        List<Object[]> topEntities = alertRepository.getTopAlertedEntities(
                PageRequest.of(0, 10));
        Map<String, Long> topAlertedEntities = new HashMap<>();
        topEntities.forEach(entity -> {
            String key = entity[0] + ":" + entity[1];
            topAlertedEntities.put(key, (Long) entity[2]);
        });

        return AlertStatisticsResponse.builder()
                .totalAlerts(alertRepository.count())
                .activeAlerts(alertRepository.countActiveAlerts())
                .acknowledgedAlerts(alertRepository.countByStatus(AlertStatus.ACKNOWLEDGED))
                .resolvedAlerts(alertRepository.countByStatus(AlertStatus.RESOLVED))
                .escalatedAlerts(alertRepository.countByStatus(AlertStatus.ESCALATED))
                .alertsByType(alertsByType)
                .alertsByLevel(alertsByLevel)
                .alertsByStatus(alertsByStatus)
                .averageAcknowledgmentTimeMinutes(alertRepository.getAverageAcknowledgmentTimeMinutes())
                .averageResolutionTimeMinutes(alertRepository.getAverageResolutionTimeMinutes())
                .alertsLast24Hours(alertRepository.countByCreatedAtAfter(last24Hours))
                .alertsLast7Days(alertRepository.countByCreatedAtAfter(last7Days))
                .alertsLast30Days(alertRepository.countByCreatedAtAfter(last30Days))
                .topAlertedEntities(topAlertedEntities)
                .build();
    }

    @Override
    public void processAlertEscalation() {
        log.info("Processing alert escalation");

        // Trouver les alertes non acquittées depuis plus de 30 minutes
        LocalDateTime thresholdTime = LocalDateTime.now().minusMinutes(30);
        List<Alert> alertsToEscalate = alertRepository.findAlertsRequiringEscalation(thresholdTime);

        log.info("Found {} alerts requiring escalation", alertsToEscalate.size());

        alertsToEscalate.forEach(alert -> {
            try {
                escalateAlert(alert.getId());
            } catch (Exception e) {
                log.error("Failed to escalate alert: {}", alert.getId(), e);
            }
        });
    }

    @Override
    public void cleanupOldResolvedAlerts(int daysOld) {
        log.info("Cleaning up resolved alerts older than {} days", daysOld);

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        alertRepository.deleteOldResolvedAlerts(cutoffDate);

        log.info("Old resolved alerts cleaned up successfully");
    }

    /**
     * Mapper une entité Alert vers AlertResponse
     */
    private AlertResponse mapToResponse(Alert alert) {
        AlertResponse.AlertResponseBuilder builder = AlertResponse.builder()
                .id(alert.getId())
                .type(alert.getType())
                .level(alert.getLevel())
                .entityType(alert.getEntityType())
                .entityId(alert.getEntityId())
                .message(alert.getMessage())
                .status(alert.getStatus())
                .data(alert.getData())
                .acknowledgedBy(alert.getAcknowledgedBy())
                .resolvedBy(alert.getResolvedBy())
                .acknowledged(alert.getAcknowledged())
                .resolved(alert.getResolved())
                .respondedAt(alert.getRespondedAt())
                .resolvedAt(alert.getResolvedAt())
                .escalationLevel(alert.getEscalationLevel())
                .recurringDailyCount(alert.getRecurringDailyCount())
                .lastRecurrenceAt(alert.getLastRecurrenceAt())
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt());

        // Ajouter le résumé de la règle si présente
        if (alert.getRule() != null) {
            builder.rule(RuleSummaryDTO.builder()
                    .id(alert.getRule().getId())
                    .name(alert.getRule().getName())
                    .severity(alert.getRule().getSeverity())
                    .isActive(alert.getRule().getIsActive())
                    .build());
        }

        return builder.build();
    }
}
