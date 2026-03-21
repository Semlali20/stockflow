package com.stock.alertservice.controller;

import com.stock.alertservice.dto.request.RuleCreateRequest;
import com.stock.alertservice.dto.request.RuleUpdateRequest;
import com.stock.alertservice.dto.response.ApiResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.dto.response.RuleResponse;
import com.stock.alertservice.enums.Frequency;
import com.stock.alertservice.enums.RuleSeverity;
import com.stock.alertservice.enums.RuleType;
import com.stock.alertservice.service.RuleService;
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
 * Controller pour la gestion des règles d'alerte
 */
@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Rules", description = "API pour la gestion des règles d'alerte")
public class RuleController {

    private final RuleService ruleService;

    // ==================== CREATE ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Créer une nouvelle règle", description = "Crée une nouvelle règle d'alerte")
    public ResponseEntity<ApiResponse<RuleResponse>> createRule(
            @Valid @RequestBody RuleCreateRequest request) {

        log.info("REST request to create rule: {}", request.getName());

        RuleResponse response = ruleService.createRule(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rule created successfully", response));
    }

    // ==================== READ ====================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer une règle par ID", description = "Récupère les détails d'une règle par son ID")
    public ResponseEntity<ApiResponse<RuleResponse>> getRuleById(
            @Parameter(description = "ID de la règle") @PathVariable String id) {

        log.info("REST request to get rule by ID: {}", id);

        RuleResponse response = ruleService.getRuleById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer une règle par nom", description = "Récupère les détails d'une règle par son nom")
    public ResponseEntity<ApiResponse<RuleResponse>> getRuleByName(
            @Parameter(description = "Nom de la règle") @PathVariable String name) {

        log.info("REST request to get rule by name: {}", name);

        RuleResponse response = ruleService.getRuleByName(name);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer toutes les règles", description = "Récupère toutes les règles avec pagination")
    public ResponseEntity<PageResponse<RuleResponse>> getAllRules(
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Tri par") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri") @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.info("REST request to get all rules - page: {}, size: {}", page, size);

        PageResponse<RuleResponse> response = ruleService.getAllRules(page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les règles actives", description = "Récupère toutes les règles actives")
    public ResponseEntity<ApiResponse<List<RuleResponse>>> getActiveRules() {
        log.info("REST request to get active rules");

        List<RuleResponse> response = ruleService.getActiveRules();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/event/{event}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les règles par événement", description = "Récupère les règles pour un type d'événement")
    public ResponseEntity<ApiResponse<List<RuleResponse>>> getRulesByEvent(
            @Parameter(description = "Type d'événement") @PathVariable String event) {

        log.info("REST request to get rules by event: {}", event);

        List<RuleResponse> response = ruleService.getRulesByEvent(event);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/event/{event}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les règles actives par événement", description = "Récupère les règles actives pour un type d'événement")
    public ResponseEntity<ApiResponse<List<RuleResponse>>> getActiveRulesByEvent(
            @Parameter(description = "Type d'événement") @PathVariable String event) {

        log.info("REST request to get active rules by event: {}", event);

        List<RuleResponse> response = ruleService.getActiveRulesByEvent(event);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/severity/{severity}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les règles par gravité", description = "Récupère les règles par niveau de gravité")
    public ResponseEntity<ApiResponse<List<RuleResponse>>> getRulesBySeverity(
            @Parameter(description = "Niveau de gravité") @PathVariable RuleSeverity severity) {

        log.info("REST request to get rules by severity: {}", severity);

        List<RuleResponse> response = ruleService.getRulesBySeverity(severity);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les règles par type", description = "Récupère les règles par type de règle")
    public ResponseEntity<ApiResponse<List<RuleResponse>>> getRulesByType(
            @Parameter(description = "Type de règle") @PathVariable RuleType type) {

        log.info("REST request to get rules by type: {}", type);

        List<RuleResponse> response = ruleService.getRulesByType(type);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/frequency/{frequency}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les règles par fréquence", description = "Récupère les règles par fréquence d'évaluation")
    public ResponseEntity<ApiResponse<List<RuleResponse>>> getRulesByFrequency(
            @Parameter(description = "Fréquence") @PathVariable Frequency frequency) {

        log.info("REST request to get rules by frequency: {}", frequency);

        List<RuleResponse> response = ruleService.getRulesByFrequency(frequency);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== UPDATE ====================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Mettre à jour une règle", description = "Met à jour une règle existante")
    public ResponseEntity<ApiResponse<RuleResponse>> updateRule(
            @Parameter(description = "ID de la règle") @PathVariable String id,
            @Valid @RequestBody RuleUpdateRequest request) {

        log.info("REST request to update rule: {}", id);

        RuleResponse response = ruleService.updateRule(id, request);

        return ResponseEntity.ok(ApiResponse.success("Rule updated successfully", response));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Activer une règle", description = "Active une règle désactivée")
    public ResponseEntity<ApiResponse<RuleResponse>> activateRule(
            @Parameter(description = "ID de la règle") @PathVariable String id) {

        log.info("REST request to activate rule: {}", id);

        RuleResponse response = ruleService.activateRule(id);

        return ResponseEntity.ok(ApiResponse.success("Rule activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Désactiver une règle", description = "Désactive une règle active")
    public ResponseEntity<ApiResponse<RuleResponse>> deactivateRule(
            @Parameter(description = "ID de la règle") @PathVariable String id) {

        log.info("REST request to deactivate rule: {}", id);

        RuleResponse response = ruleService.deactivateRule(id);

        return ResponseEntity.ok(ApiResponse.success("Rule deactivated successfully", response));
    }

    // ==================== DELETE ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une règle", description = "Supprime une règle définitivement")
    public ResponseEntity<ApiResponse<Void>> deleteRule(
            @Parameter(description = "ID de la règle") @PathVariable String id) {

        log.info("REST request to delete rule: {}", id);

        ruleService.deleteRule(id);

        return ResponseEntity.ok(ApiResponse.success("Rule deleted successfully", null));
    }

    // ==================== SEARCH ====================

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Rechercher des règles", description = "Recherche des règles avec des filtres")
    public ResponseEntity<PageResponse<RuleResponse>> searchRules(
            @Parameter(description = "Nom de la règle") @RequestParam(required = false) String name,
            @Parameter(description = "Type d'événement") @RequestParam(required = false) String event,
            @Parameter(description = "Gravité") @RequestParam(required = false) RuleSeverity severity,
            @Parameter(description = "Est active") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to search rules");

        PageResponse<RuleResponse> response = ruleService.searchRules(name, event, severity, isActive, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== STATISTICS ====================

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Obtenir les statistiques des règles", description = "Récupère les statistiques globales des règles")
    public ResponseEntity<ApiResponse<Object>> getRuleStatistics() {
        log.info("REST request to get rule statistics");

        Object response = ruleService.getRuleStatistics();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
