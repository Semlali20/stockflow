package com.stock.alertservice.repository;

import com.stock.alertservice.entity.Notification;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour la gestion des notifications
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    /**
     * Trouver les notifications par alerte
     */
    List<Notification> findByAlert_Id(String alertId);

    /**
     * Trouver les notifications par statut
     */
    Page<Notification> findByStatus(NotificationStatus status, Pageable pageable);

    /**
     * Trouver les notifications par canal
     */
    Page<Notification> findByChannelType(NotificationChannelType channelType, Pageable pageable);

    /**
     * Trouver les notifications par destinataire
     */
    List<Notification> findByRecipient(String recipient);

    /**
     * Trouver les notifications en attente
     */
    List<Notification> findByStatus(NotificationStatus status);

    /**
     * Trouver les notifications en attente avec retry < max
     */
    @Query("SELECT n FROM Notification n WHERE n.status IN ('PENDING', 'FAILED') " +
            "AND n.retryCount < 3 ORDER BY n.createdAt ASC")
    List<Notification> findNotificationsToRetry();

    /**
     * Trouver les notifications échouées avec retry >= max
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' AND n.retryCount >= 3")
    List<Notification> findFailedNotificationsExhausted();

    /**
     * Compter les notifications par statut
     */
    long countByStatus(NotificationStatus status);

    /**
     * Compter les notifications par canal
     */
    long countByChannelType(NotificationChannelType channelType);

    /**
     * Compter les notifications par alerte
     */
    long countByAlert_Id(String alertId);

    /**
     * Compter les notifications envoyées après une date
     */
    long countBySentAtAfter(LocalDateTime dateTime);

    /**
     * Compter les notifications d'un canal envoyées dans la dernière heure
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.channelType = :channelType " +
            "AND n.status IN ('SENT', 'DELIVERED') AND n.sentAt >= :since")
    long countRecentNotificationsByChannel(
            @Param("channelType") NotificationChannelType channelType,
            @Param("since") LocalDateTime since
    );

    /**
     * Recherche avancée de notifications
     */
    @Query("SELECT n FROM Notification n WHERE " +
            "(:status IS NULL OR n.status = :status) AND " +
            "(:channelType IS NULL OR n.channelType = :channelType) AND " +
            "(:recipient IS NULL OR n.recipient = :recipient) AND " +
            "(:alertId IS NULL OR n.alert.id = :alertId) AND " +
            "(:createdAfter IS NULL OR n.createdAt >= :createdAfter) AND " +
            "(:createdBefore IS NULL OR n.createdAt <= :createdBefore)")
    Page<Notification> searchNotifications(
            @Param("status") NotificationStatus status,
            @Param("channelType") NotificationChannelType channelType,
            @Param("recipient") String recipient,
            @Param("alertId") String alertId,
            @Param("createdAfter") LocalDateTime createdAfter,
            @Param("createdBefore") LocalDateTime createdBefore,
            Pageable pageable
    );

    /**
     * Obtenir les statistiques des notifications par statut
     */
    @Query("SELECT n.status, COUNT(n) FROM Notification n GROUP BY n.status")
    List<Object[]> getNotificationStatisticsByStatus();

    /**
     * Obtenir les statistiques des notifications par canal
     */
    @Query("SELECT n.channelType, COUNT(n) FROM Notification n GROUP BY n.channelType")
    List<Object[]> getNotificationStatisticsByChannel();

    /**
     * Calculer le taux de succès par canal
     */
    @Query("SELECT n.channelType, " +
            "SUM(CASE WHEN n.status IN ('SENT', 'DELIVERED') THEN 1 ELSE 0 END) as success, " +
            "COUNT(n) as total " +
            "FROM Notification n GROUP BY n.channelType")
    List<Object[]> getSuccessRateByChannel();

    /**
     * Supprimer les anciennes notifications
     */
    @Query("DELETE FROM Notification n WHERE n.status IN ('SENT', 'DELIVERED') " +
            "AND n.sentAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
}