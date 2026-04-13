package com.stock.alertservice.service;

import com.stock.alertservice.dto.response.NotificationResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.enums.NotificationStatus;

import java.util.List;
import java.util.Map;

/**
 * Service pour la gestion des notifications
 */
public interface NotificationService {

    /**
     * Envoyer une notification pour une alerte
     */
    void sendNotificationForAlert(String alertId);

    /**
     * Envoyer une notification personnalisée
     */
    NotificationResponse sendNotification(
            NotificationChannelType channelType,
            String recipient,
            String subject,
            String body,
            String alertId,
            String templateId
    );

    /**
     * Récupérer une notification par ID
     */
    NotificationResponse getNotificationById(String id);

    /**
     * Récupérer toutes les notifications avec pagination
     */
    PageResponse<NotificationResponse> getAllNotifications(
            int page,
            int size,
            String sortBy,
            String sortDirection
    );

    /**
     * Récupérer les notifications par alerte
     */
    List<NotificationResponse> getNotificationsByAlert(String alertId);

    /**
     * Récupérer les notifications par statut
     */
    PageResponse<NotificationResponse> getNotificationsByStatus(
            NotificationStatus status,
            int page,
            int size
    );

    /**
     * Récupérer les notifications par canal
     */
    PageResponse<NotificationResponse> getNotificationsByChannel(
            NotificationChannelType channelType,
            int page,
            int size
    );

    /**
     * Récupérer les notifications par destinataire
     */
    List<NotificationResponse> getNotificationsByRecipient(String recipient);

    /**
     * Réessayer l'envoi des notifications échouées
     */
    void retryFailedNotifications();

    /**
     * Marquer une notification comme livrée
     */
    NotificationResponse markAsDelivered(String id);

    /**
     * Marquer une notification comme échouée
     */
    NotificationResponse markAsFailed(String id, String errorMessage);

    /**
     * Rechercher des notifications
     */
    PageResponse<NotificationResponse> searchNotifications(
            NotificationStatus status,
            NotificationChannelType channelType,
            String recipient,
            String alertId,
            int page,
            int size
    );

    /**
     * Obtenir les statistiques des notifications
     */
    Map<String, Object> getNotificationStatistics();

    /**
     * Nettoyer les anciennes notifications
     */
    void cleanupOldNotifications(int daysOld);
}
