package com.stock.alertservice.controller;

import com.stock.alertservice.dto.request.NotificationChannelRequest;
import com.stock.alertservice.dto.response.ApiResponse;
import com.stock.alertservice.dto.response.NotificationChannelResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.service.NotificationChannelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller pour la gestion des canaux de notification
 */
@RestController
@RequestMapping("/api/notification-channels")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification Channels", description = "API pour la gestion des canaux de notification")
public class NotificationChannelController {

    private final NotificationChannelService channelService;

    // ==================== CREATE ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Créer un canal", description = "Crée un nouveau canal de notification")
    public ResponseEntity<ApiResponse<NotificationChannelResponse>> createChannel(
            @Valid @RequestBody NotificationChannelRequest request) {

        log.info("REST request to create notification channel: {}", request.getName());

        NotificationChannelResponse response = channelService.createChannel(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Channel created successfully", response));
    }

    // ==================== READ ====================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer un canal par ID", description = "Récupère les détails d'un canal par son ID")
    public ResponseEntity<ApiResponse<NotificationChannelResponse>> getChannelById(
            @Parameter(description = "ID du canal") @PathVariable String id) {

        log.info("REST request to get notification channel by ID: {}", id);

        NotificationChannelResponse response = channelService.getChannelById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer un canal par nom", description = "Récupère les détails d'un canal par son nom")
    public ResponseEntity<ApiResponse<NotificationChannelResponse>> getChannelByName(
            @Parameter(description = "Nom du canal") @PathVariable String name) {

        log.info("REST request to get notification channel by name: {}", name);

        NotificationChannelResponse response = channelService.getChannelByName(name);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer tous les canaux", description = "Récupère tous les canaux avec pagination")
    public ResponseEntity<PageResponse<NotificationChannelResponse>> getAllChannels(
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Tri par") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri") @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.info("REST request to get all notification channels - page: {}, size: {}", page, size);

        PageResponse<NotificationChannelResponse> response = channelService.getAllChannels(
                page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les canaux actifs", description = "Récupère tous les canaux actifs")
    public ResponseEntity<ApiResponse<List<NotificationChannelResponse>>> getActiveChannels() {
        log.info("REST request to get active notification channels");

        List<NotificationChannelResponse> response = channelService.getActiveChannels();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les canaux par type", description = "Récupère les canaux pour un type spécifique")
    public ResponseEntity<ApiResponse<List<NotificationChannelResponse>>> getChannelsByType(
            @Parameter(description = "Type de canal") @PathVariable NotificationChannelType type) {

        log.info("REST request to get notification channels by type: {}", type);

        List<NotificationChannelResponse> response = channelService.getChannelsByType(type);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/type/{type}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les canaux actifs par type", description = "Récupère les canaux actifs pour un type")
    public ResponseEntity<ApiResponse<List<NotificationChannelResponse>>> getActiveChannelsByType(
            @Parameter(description = "Type de canal") @PathVariable NotificationChannelType type) {

        log.info("REST request to get active notification channels by type: {}", type);

        List<NotificationChannelResponse> response = channelService.getActiveChannelsByType(type);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/type/{type}/top-priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer le canal prioritaire", description = "Récupère le canal avec la plus haute priorité pour un type")
    public ResponseEntity<ApiResponse<NotificationChannelResponse>> getTopPriorityChannelByType(
            @Parameter(description = "Type de canal") @PathVariable NotificationChannelType type) {

        log.info("REST request to get top priority notification channel by type: {}", type);

        NotificationChannelResponse response = channelService.getTopPriorityChannelByType(type);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== UPDATE ====================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Mettre à jour un canal", description = "Met à jour un canal existant")
    public ResponseEntity<ApiResponse<NotificationChannelResponse>> updateChannel(
            @Parameter(description = "ID du canal") @PathVariable String id,
            @Valid @RequestBody NotificationChannelRequest request) {

        log.info("REST request to update notification channel: {}", id);

        NotificationChannelResponse response = channelService.updateChannel(id, request);

        return ResponseEntity.ok(ApiResponse.success("Channel updated successfully", response));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Activer un canal", description = "Active un canal désactivé")
    public ResponseEntity<ApiResponse<NotificationChannelResponse>> activateChannel(
            @Parameter(description = "ID du canal") @PathVariable String id) {

        log.info("REST request to activate notification channel: {}", id);

        NotificationChannelResponse response = channelService.activateChannel(id);

        return ResponseEntity.ok(ApiResponse.success("Channel activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Désactiver un canal", description = "Désactive un canal actif")
    public ResponseEntity<ApiResponse<NotificationChannelResponse>> deactivateChannel(
            @Parameter(description = "ID du canal") @PathVariable String id) {

        log.info("REST request to deactivate notification channel: {}", id);

        NotificationChannelResponse response = channelService.deactivateChannel(id);

        return ResponseEntity.ok(ApiResponse.success("Channel deactivated successfully", response));
    }

    // ==================== DELETE ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un canal", description = "Supprime un canal définitivement")
    public ResponseEntity<ApiResponse<Void>> deleteChannel(
            @Parameter(description = "ID du canal") @PathVariable String id) {

        log.info("REST request to delete notification channel: {}", id);

        channelService.deleteChannel(id);

        return ResponseEntity.ok(ApiResponse.success("Channel deleted successfully", null));
    }

    // ==================== SEARCH ====================

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Rechercher des canaux", description = "Recherche des canaux avec des filtres")
    public ResponseEntity<PageResponse<NotificationChannelResponse>> searchChannels(
            @Parameter(description = "Nom du canal") @RequestParam(required = false) String name,
            @Parameter(description = "Type de canal") @RequestParam(required = false) NotificationChannelType channelType,
            @Parameter(description = "Est actif") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to search notification channels");

        PageResponse<NotificationChannelResponse> response = channelService.searchChannels(
                name, channelType, isActive, page, size);

        return ResponseEntity.ok(response);
    }
}
