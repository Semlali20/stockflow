package com.stock.alertservice.service;

import com.stock.alertservice.dto.request.NotificationChannelRequest;
import com.stock.alertservice.dto.response.NotificationChannelResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.NotificationChannelType;

import java.util.List;

/**
 * Service pour la gestion des canaux de notification
 */
public interface NotificationChannelService {

    /**
     * Créer un nouveau canal
     */
    NotificationChannelResponse createChannel(NotificationChannelRequest request);

    /**
     * Récupérer un canal par ID
     */
    NotificationChannelResponse getChannelById(String id);

    /**
     * Récupérer un canal par nom
     */
    NotificationChannelResponse getChannelByName(String name);

    /**
     * Mettre à jour un canal
     */
    NotificationChannelResponse updateChannel(String id, NotificationChannelRequest request);

    /**
     * Supprimer un canal
     */
    void deleteChannel(String id);

    /**
     * Activer un canal
     */
    NotificationChannelResponse activateChannel(String id);

    /**
     * Désactiver un canal
     */
    NotificationChannelResponse deactivateChannel(String id);

    /**
     * Récupérer tous les canaux avec pagination
     */
    PageResponse<NotificationChannelResponse> getAllChannels(
            int page,
            int size,
            String sortBy,
            String sortDirection
    );

    /**
     * Récupérer tous les canaux actifs
     */
    List<NotificationChannelResponse> getActiveChannels();

    /**
     * Récupérer les canaux par type
     */
    List<NotificationChannelResponse> getChannelsByType(NotificationChannelType channelType);

    /**
     * Récupérer les canaux actifs par type
     */
    List<NotificationChannelResponse> getActiveChannelsByType(NotificationChannelType channelType);

    /**
     * Récupérer le canal avec la plus haute priorité pour un type
     */
    NotificationChannelResponse getTopPriorityChannelByType(NotificationChannelType channelType);

    /**
     * Rechercher des canaux
     */
    PageResponse<NotificationChannelResponse> searchChannels(
            String name,
            NotificationChannelType channelType,
            Boolean isActive,
            int page,
            int size
    );
}
