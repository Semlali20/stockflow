package com.stock.alertservice.service;

import com.stock.alertservice.dto.request.NotificationTemplateRequest;
import com.stock.alertservice.dto.response.NotificationTemplateResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.enums.NotificationChannelType;

import java.util.List;
import java.util.Map;

/**
 * Service pour la gestion des templates de notification
 */
public interface NotificationTemplateService {

    /**
     * Créer un nouveau template
     */
    NotificationTemplateResponse createTemplate(NotificationTemplateRequest request);

    /**
     * Récupérer un template par ID
     */
    NotificationTemplateResponse getTemplateById(String id);

    /**
     * Récupérer un template par nom
     */
    NotificationTemplateResponse getTemplateByName(String name);

    /**
     * Mettre à jour un template
     */
    NotificationTemplateResponse updateTemplate(String id, NotificationTemplateRequest request);

    /**
     * Supprimer un template
     */
    void deleteTemplate(String id);

    /**
     * Activer un template
     */
    NotificationTemplateResponse activateTemplate(String id);

    /**
     * Désactiver un template
     */
    NotificationTemplateResponse deactivateTemplate(String id);

    /**
     * Récupérer tous les templates avec pagination
     */
    PageResponse<NotificationTemplateResponse> getAllTemplates(
            int page,
            int size,
            String sortBy,
            String sortDirection
    );

    /**
     * Récupérer tous les templates actifs
     */
    List<NotificationTemplateResponse> getActiveTemplates();

    /**
     * Récupérer les templates par canal
     */
    List<NotificationTemplateResponse> getTemplatesByChannel(NotificationChannelType channel);

    /**
     * Récupérer les templates par type d'alerte
     */
    List<NotificationTemplateResponse> getTemplatesByAlertType(AlertType alertType);

    /**
     * Récupérer un template par type d'alerte et canal
     */
    NotificationTemplateResponse getTemplateByTypeAndChannel(
            AlertType alertType,
            NotificationChannelType channel
    );

    /**
     * Traiter un template avec des variables
     */
    String processTemplate(String templateId, Map<String, Object> variables);

    /**
     * Rechercher des templates
     */
    PageResponse<NotificationTemplateResponse> searchTemplates(
            String name,
            NotificationChannelType channel,
            AlertType templateType,
            String language,
            Boolean isActive,
            int page,
            int size
    );
}
