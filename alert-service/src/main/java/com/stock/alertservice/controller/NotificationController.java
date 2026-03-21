package com.stock.alertservice.controller;

import com.stock.alertservice.dto.response.ApiResponse;
import com.stock.alertservice.dto.response.NotificationResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.enums.NotificationStatus;
import com.stock.alertservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller pour la gestion des notifications
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "API pour la gestion des notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // ==================== READ ====================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer une notification par ID", description = "Récupère les détails d'une notification par son ID")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @Parameter(description = "ID de la notification") @PathVariable String id) {

        log.info("REST request to get notification by ID: {}", id);

        NotificationResponse response = notificationService.getNotificationById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer toutes les notifications", description = "Récupère toutes les notifications avec pagination")
    public ResponseEntity<PageResponse<NotificationResponse>> getAllNotifications(
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Tri par") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri") @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.info("REST request to get all notifications - page: {}, size: {}", page, size);

        PageResponse<NotificationResponse> response = notificationService.getAllNotifications(
                page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/alert/{alertId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les notifications par alerte", description = "Récupère les notifications pour une alerte")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotificationsByAlert(
            @Parameter(description = "ID de l'alerte") @PathVariable String alertId) {

        log.info("REST request to get notifications by alert: {}", alertId);

        List<NotificationResponse> response = notificationService.getNotificationsByAlert(alertId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les notifications par statut", description = "Récupère les notifications par statut")
    public ResponseEntity<PageResponse<NotificationResponse>> getNotificationsByStatus(
            @Parameter(description = "Statut de la notification") @PathVariable NotificationStatus status,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get notifications by status: {} - page: {}, size: {}", status, page, size);

        PageResponse<NotificationResponse> response = notificationService.getNotificationsByStatus(
                status, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/channel/{channelType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les notifications par canal", description = "Récupère les notifications par type de canal")
    public ResponseEntity<PageResponse<NotificationResponse>> getNotificationsByChannel(
            @Parameter(description = "Type de canal") @PathVariable NotificationChannelType channelType,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get notifications by channel: {} - page: {}, size: {}",
                channelType, page, size);

        PageResponse<NotificationResponse> response = notificationService.getNotificationsByChannel(
                channelType, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/recipient/{recipient}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les notifications par destinataire", description = "Récupère les notifications pour un destinataire")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotificationsByRecipient(
            @Parameter(description = "Destinataire") @PathVariable String recipient) {

        log.info("REST request to get notifications by recipient: {}", recipient);

        List<NotificationResponse> response = notificationService.getNotificationsByRecipient(recipient);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== SEND ====================

    @PostMapping("/send-for-alert/{alertId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Envoyer une notification pour une alerte", description = "Envoie une notification pour une alerte spécifique")
    public ResponseEntity<ApiResponse<Void>> sendNotificationForAlert(
            @Parameter(description = "ID de l'alerte") @PathVariable String alertId) {

        log.info("REST request to send notification for alert: {}", alertId);

        notificationService.sendNotificationForAlert(alertId);

        return ResponseEntity.ok(ApiResponse.success("Notification sent successfully", null));
    }

    // ==================== UPDATE ====================

    @PatchMapping("/{id}/mark-delivered")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Marquer comme livrée", description = "Marque une notification comme livrée")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsDelivered(
            @Parameter(description = "ID de la notification") @PathVariable String id) {

        log.info("REST request to mark notification as delivered: {}", id);

        NotificationResponse response = notificationService.markAsDelivered(id);

        return ResponseEntity.ok(ApiResponse.success("Notification marked as delivered", response));
    }

    @PatchMapping("/{id}/mark-failed")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Marquer comme échouée", description = "Marque une notification comme échouée")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsFailed(
            @Parameter(description = "ID de la notification") @PathVariable String id,
            @Parameter(description = "Message d'erreur") @RequestParam String errorMessage) {

        log.info("REST request to mark notification as failed: {}", id);

        NotificationResponse response = notificationService.markAsFailed(id, errorMessage);

        return ResponseEntity.ok(ApiResponse.success("Notification marked as failed", response));
    }

    // ==================== RETRY ====================

    @PostMapping("/retry-failed")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Réessayer les notifications échouées", description = "Réessaie l'envoi des notifications échouées")
    public ResponseEntity<ApiResponse<Void>> retryFailedNotifications() {
        log.info("REST request to retry failed notifications");

        notificationService.retryFailedNotifications();

        return ResponseEntity.ok(ApiResponse.success("Failed notifications retry initiated", null));
    }

    // ==================== SEARCH ====================

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Rechercher des notifications", description = "Recherche des notifications avec des filtres")
    public ResponseEntity<PageResponse<NotificationResponse>> searchNotifications(
            @Parameter(description = "Statut") @RequestParam(required = false) NotificationStatus status,
            @Parameter(description = "Type de canal") @RequestParam(required = false) NotificationChannelType channelType,
            @Parameter(description = "Destinataire") @RequestParam(required = false) String recipient,
            @Parameter(description = "ID de l'alerte") @RequestParam(required = false) String alertId,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to search notifications");

        PageResponse<NotificationResponse> response = notificationService.searchNotifications(
                status, channelType, recipient, alertId, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== STATISTICS ====================

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Obtenir les statistiques des notifications", description = "Récupère les statistiques globales des notifications")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotificationStatistics() {
        log.info("REST request to get notification statistics");

        Map<String, Object> response = notificationService.getNotificationStatistics();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== CLEANUP ====================

    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Nettoyer les anciennes notifications", description = "Supprime les notifications anciennes")
    public ResponseEntity<ApiResponse<Void>> cleanupOldNotifications(
            @Parameter(description = "Nombre de jours") @RequestParam(defaultValue = "90") int daysOld) {

        log.info("REST request to cleanup old notifications - daysOld: {}", daysOld);

        notificationService.cleanupOldNotifications(daysOld);

        return ResponseEntity.ok(ApiResponse.success("Old notifications cleaned up successfully", null));
    }
}
