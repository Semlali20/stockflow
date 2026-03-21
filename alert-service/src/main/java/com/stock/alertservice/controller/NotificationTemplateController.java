package com.stock.alertservice.controller;

import com.stock.alertservice.dto.request.NotificationTemplateRequest;
import com.stock.alertservice.dto.response.ApiResponse;
import com.stock.alertservice.dto.response.NotificationTemplateResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.service.NotificationTemplateService;
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
import java.util.Map;

/**
 * Controller pour la gestion des templates de notification
 */
@RestController
@RequestMapping("/api/notification-templates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification Templates", description = "API pour la gestion des templates de notification")
public class NotificationTemplateController {

    private final NotificationTemplateService templateService;

    // ==================== CREATE ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Créer un template", description = "Crée un nouveau template de notification")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> createTemplate(
            @Valid @RequestBody NotificationTemplateRequest request) {

        log.info("REST request to create notification template: {}", request.getName());

        NotificationTemplateResponse response = templateService.createTemplate(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Template created successfully", response));
    }

    // ==================== READ ====================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer un template par ID", description = "Récupère les détails d'un template par son ID")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getTemplateById(
            @Parameter(description = "ID du template") @PathVariable String id) {

        log.info("REST request to get notification template by ID: {}", id);

        NotificationTemplateResponse response = templateService.getTemplateById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer un template par nom", description = "Récupère les détails d'un template par son nom")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getTemplateByName(
            @Parameter(description = "Nom du template") @PathVariable String name) {

        log.info("REST request to get notification template by name: {}", name);

        NotificationTemplateResponse response = templateService.getTemplateByName(name);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer tous les templates", description = "Récupère tous les templates avec pagination")
    public ResponseEntity<PageResponse<NotificationTemplateResponse>> getAllTemplates(
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Tri par") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri") @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.info("REST request to get all notification templates - page: {}, size: {}", page, size);

        PageResponse<NotificationTemplateResponse> response = templateService.getAllTemplates(
                page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les templates actifs", description = "Récupère tous les templates actifs")
    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getActiveTemplates() {
        log.info("REST request to get active notification templates");

        List<NotificationTemplateResponse> response = templateService.getActiveTemplates();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/channel/{channel}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les templates par canal", description = "Récupère les templates pour un canal spécifique")
    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getTemplatesByChannel(
            @Parameter(description = "Type de canal") @PathVariable NotificationChannelType channel) {

        log.info("REST request to get notification templates by channel: {}", channel);

        List<NotificationTemplateResponse> response = templateService.getTemplatesByChannel(channel);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/alert-type/{alertType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les templates par type d'alerte", description = "Récupère les templates pour un type d'alerte")
    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getTemplatesByAlertType(
            @Parameter(description = "Type d'alerte") @PathVariable AlertType alertType) {

        log.info("REST request to get notification templates by alert type: {}", alertType);

        List<NotificationTemplateResponse> response = templateService.getTemplatesByAlertType(alertType);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/find")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Trouver un template par type et canal", description = "Trouve un template actif par type d'alerte et canal")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getTemplateByTypeAndChannel(
            @Parameter(description = "Type d'alerte") @RequestParam AlertType alertType,
            @Parameter(description = "Type de canal") @RequestParam NotificationChannelType channel) {

        log.info("REST request to find notification template by type: {} and channel: {}", alertType, channel);

        NotificationTemplateResponse response = templateService.getTemplateByTypeAndChannel(alertType, channel);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== UPDATE ====================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Mettre à jour un template", description = "Met à jour un template existant")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> updateTemplate(
            @Parameter(description = "ID du template") @PathVariable String id,
            @Valid @RequestBody NotificationTemplateRequest request) {

        log.info("REST request to update notification template: {}", id);

        NotificationTemplateResponse response = templateService.updateTemplate(id, request);

        return ResponseEntity.ok(ApiResponse.success("Template updated successfully", response));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Activer un template", description = "Active un template désactivé")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> activateTemplate(
            @Parameter(description = "ID du template") @PathVariable String id) {

        log.info("REST request to activate notification template: {}", id);

        NotificationTemplateResponse response = templateService.activateTemplate(id);

        return ResponseEntity.ok(ApiResponse.success("Template activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Désactiver un template", description = "Désactive un template actif")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> deactivateTemplate(
            @Parameter(description = "ID du template") @PathVariable String id) {

        log.info("REST request to deactivate notification template: {}", id);

        NotificationTemplateResponse response = templateService.deactivateTemplate(id);

        return ResponseEntity.ok(ApiResponse.success("Template deactivated successfully", response));
    }

    // ==================== DELETE ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un template", description = "Supprime un template définitivement")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(
            @Parameter(description = "ID du template") @PathVariable String id) {

        log.info("REST request to delete notification template: {}", id);

        templateService.deleteTemplate(id);

        return ResponseEntity.ok(ApiResponse.success("Template deleted successfully", null));
    }

    // ==================== PROCESS ====================

    @PostMapping("/{id}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Traiter un template", description = "Traite un template avec des variables")
    public ResponseEntity<ApiResponse<String>> processTemplate(
            @Parameter(description = "ID du template") @PathVariable String id,
            @RequestBody Map<String, Object> variables) {

        log.info("REST request to process notification template: {}", id);

        String processedBody = templateService.processTemplate(id, variables);

        return ResponseEntity.ok(ApiResponse.success("Template processed successfully", processedBody));
    }

    // ==================== SEARCH ====================

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Rechercher des templates", description = "Recherche des templates avec des filtres")
    public ResponseEntity<PageResponse<NotificationTemplateResponse>> searchTemplates(
            @Parameter(description = "Nom du template") @RequestParam(required = false) String name,
            @Parameter(description = "Type de canal") @RequestParam(required = false) NotificationChannelType channel,
            @Parameter(description = "Type d'alerte") @RequestParam(required = false) AlertType templateType,
            @Parameter(description = "Langue") @RequestParam(required = false) String language,
            @Parameter(description = "Est actif") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to search notification templates");

        PageResponse<NotificationTemplateResponse> response = templateService.searchTemplates(
                name, channel, templateType, language, isActive, page, size);

        return ResponseEntity.ok(response);
    }
}
