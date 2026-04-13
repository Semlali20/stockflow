package com.stock.alertservice.service;

import com.stock.alertservice.dto.request.AlertAcknowledgeRequest;
import com.stock.alertservice.dto.request.AlertFilterRequest;
import com.stock.alertservice.dto.request.AlertResolveRequest;
import com.stock.alertservice.dto.response.AlertResponse;
import com.stock.alertservice.dto.response.AlertStatisticsResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertStatus;
import com.stock.alertservice.enums.AlertType;

import java.util.List;
import java.util.Map;

/**
 * Service pour la gestion des alertes
 */
public interface AlertService {

    /**
     * Créer une nouvelle alerte
     */
    AlertResponse createAlert(
            AlertType type,
            AlertLevel level,
            String entityType,
            String entityId,
            String message,
            Map<String, Object> data,
            String ruleId
    );

    /**
     * Récupérer une alerte par ID
     */
    AlertResponse getAlertById(String id);

    /**
     * Récupérer toutes les alertes avec pagination
     */
    PageResponse<AlertResponse> getAllAlerts(int page, int size, String sortBy, String sortDirection);

    /**
     * Récupérer les alertes actives
     */
    PageResponse<AlertResponse> getActiveAlerts(int page, int size);

    /**
     * Récupérer les alertes non acquittées
     */
    PageResponse<AlertResponse> getUnacknowledgedAlerts(int page, int size);

    /**
     * Récupérer les alertes par statut
     */
    PageResponse<AlertResponse> getAlertsByStatus(AlertStatus status, int page, int size);

    /**
     * Récupérer les alertes par type
     */
    PageResponse<AlertResponse> getAlertsByType(AlertType type, int page, int size);

    /**
     * Récupérer les alertes par niveau
     */
    PageResponse<AlertResponse> getAlertsByLevel(AlertLevel level, int page, int size);

    /**
     * Récupérer les alertes d'une entité
     */
    PageResponse<AlertResponse> getAlertsByEntity(
            String entityType,
            String entityId,
            int page,
            int size
    );

    /**
     * Prendre en compte une alerte (acknowledge)
     */
    AlertResponse acknowledgeAlert(String id, AlertAcknowledgeRequest request);

    /**
     * Résoudre une alerte
     */
    AlertResponse resolveAlert(String id, AlertResolveRequest request);

    /**
     * Escalader une alerte
     */
    AlertResponse escalateAlert(String id);

    /**
     * Supprimer une alerte
     */
    void deleteAlert(String id);

    /**
     * Rechercher des alertes avec filtres
     */
    PageResponse<AlertResponse> searchAlerts(AlertFilterRequest filter, int page, int size);

    /**
     * Obtenir les statistiques des alertes
     */
    AlertStatisticsResponse getAlertStatistics();

    /**
     * Traiter les alertes nécessitant une escalade
     */
    void processAlertEscalation();

    /**
     * Nettoyer les anciennes alertes résolues
     */
    void cleanupOldResolvedAlerts(int daysOld);
}
