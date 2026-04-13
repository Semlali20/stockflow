package com.stock.alertservice.repository;

import com.stock.alertservice.entity.Alert;
import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertStatus;
import com.stock.alertservice.enums.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour la gestion des alertes
 */
@Repository
public interface AlertRepository extends JpaRepository<Alert, String> {

    /**
     * Trouver les alertes par statut
     */
    Page<Alert> findByStatus(AlertStatus status, Pageable pageable);

    /**
     * Trouver les alertes par type
     */
    Page<Alert> findByType(AlertType type, Pageable pageable);

    /**
     * Trouver les alertes par niveau
     */
    Page<Alert> findByLevel(AlertLevel level, Pageable pageable);

    /**
     * Trouver les alertes par type et statut
     */
    Page<Alert> findByTypeAndStatus(AlertType type, AlertStatus status, Pageable pageable);

    /**
     * Trouver les alertes actives (non résolues)
     */
    @Query("SELECT a FROM Alert a WHERE a.status IN ('ACTIVE', 'ACKNOWLEDGED', 'ESCALATED')")
    List<Alert> findActiveAlerts();

    /**
     * Trouver les alertes actives avec pagination
     */
    @Query("SELECT a FROM Alert a WHERE a.status IN ('ACTIVE', 'ACKNOWLEDGED', 'ESCALATED')")
    Page<Alert> findActiveAlerts(Pageable pageable);

    /**
     * Trouver les alertes d'urgence actives
     */
    @Query("SELECT a FROM Alert a WHERE a.status = 'ACTIVE' AND a.level = 'EMERGENCY'")
    List<Alert> findActiveEmergencyAlerts();

    /**
     * Trouver les alertes non acquittées
     */
    List<Alert> findByAcknowledgedFalse();

    /**
     * Trouver les alertes non acquittées avec pagination
     */
    Page<Alert> findByAcknowledgedFalse(Pageable pageable);

    /**
     * Trouver les alertes non résolues
     */
    List<Alert> findByResolvedFalse();

    /**
     * Trouver les alertes par entité
     */
    @Query("SELECT a FROM Alert a WHERE a.entityId = :entityId AND a.entityType = :entityType")
    List<Alert> findByEntity(@Param("entityId") String entityId, @Param("entityType") String entityType);

    /**
     * Trouver les alertes par entité avec pagination
     */
    @Query("SELECT a FROM Alert a WHERE a.entityId = :entityId AND a.entityType = :entityType")
    Page<Alert> findByEntity(
            @Param("entityId") String entityId,
            @Param("entityType") String entityType,
            Pageable pageable
    );

    /**
     * Trouver les alertes par règle
     */
    List<Alert> findByRuleId(String ruleId);

    /**
     * Trouver les alertes créées avant une date avec un statut donné
     */
    List<Alert> findByStatusAndCreatedAtBefore(AlertStatus status, LocalDateTime dateTime);

    /**
     * Trouver les alertes qui nécessitent une escalade
     */
    @Query("SELECT a FROM Alert a WHERE a.status = 'ACTIVE' AND a.acknowledged = false " +
            "AND a.createdAt < :thresholdTime")
    List<Alert> findAlertsRequiringEscalation(@Param("thresholdTime") LocalDateTime thresholdTime);

    /**
     * Trouver les alertes escaladées
     */
    List<Alert> findByEscalationLevelGreaterThan(Integer level);

    /**
     * Compter les alertes par statut
     */
    long countByStatus(AlertStatus status);

    /**
     * Compter les alertes par type
     */
    long countByType(AlertType type);

    /**
     * Compter les alertes par niveau
     */
    long countByLevel(AlertLevel level);

    /**
     * Compter les alertes créées après une date
     */
    long countByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Compter les alertes actives
     */
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.status IN ('ACTIVE', 'ACKNOWLEDGED', 'ESCALATED')")
    long countActiveAlerts();

    /**
     * Compter les alertes par statut et créées après une date
     */
    long countByStatusAndCreatedAtAfter(AlertStatus status, LocalDateTime dateTime);

    /**
     * Recherche avancée d'alertes
     */
    @Query("SELECT a FROM Alert a WHERE " +
            "(:type IS NULL OR a.type = :type) AND " +
            "(:level IS NULL OR a.level = :level) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:entityType IS NULL OR a.entityType = :entityType) AND " +
            "(:entityId IS NULL OR a.entityId = :entityId) AND " +
            "(:acknowledged IS NULL OR a.acknowledged = :acknowledged) AND " +
            "(:resolved IS NULL OR a.resolved = :resolved) AND " +
            "(:createdAfter IS NULL OR a.createdAt >= :createdAfter) AND " +
            "(:createdBefore IS NULL OR a.createdAt <= :createdBefore)")
    Page<Alert> searchAlerts(
            @Param("type") AlertType type,
            @Param("level") AlertLevel level,
            @Param("status") AlertStatus status,
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("acknowledged") Boolean acknowledged,
            @Param("resolved") Boolean resolved,
            @Param("createdAfter") LocalDateTime createdAfter,
            @Param("createdBefore") LocalDateTime createdBefore,
            Pageable pageable
    );

    /**
     * Obtenir les statistiques des alertes par type
     */
    @Query("SELECT a.type, COUNT(a) FROM Alert a GROUP BY a.type")
    List<Object[]> getAlertStatisticsByType();

    /**
     * Obtenir les statistiques des alertes par niveau
     */
    @Query("SELECT a.level, COUNT(a) FROM Alert a GROUP BY a.level")
    List<Object[]> getAlertStatisticsByLevel();

    /**
     * Obtenir les statistiques des alertes par statut
     */
    @Query("SELECT a.status, COUNT(a) FROM Alert a GROUP BY a.status")
    List<Object[]> getAlertStatisticsByStatus();

    /**
     * Obtenir les entités les plus alertées
     */
    @Query("SELECT a.entityType, a.entityId, COUNT(a) as alertCount " +
            "FROM Alert a GROUP BY a.entityType, a.entityId " +
            "ORDER BY alertCount DESC")
    List<Object[]> getTopAlertedEntities(Pageable pageable);

    /**
     * Calculer le temps moyen d'acquittement (en minutes)
     */
    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, a.createdAt, a.respondedAt)) " +
            "FROM Alert a WHERE a.acknowledged = true AND a.respondedAt IS NOT NULL")
    Double getAverageAcknowledgmentTimeMinutes();

    /**
     * Calculer le temps moyen de résolution (en minutes)
     */
    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, a.createdAt, a.resolvedAt)) " +
            "FROM Alert a WHERE a.resolved = true AND a.resolvedAt IS NOT NULL")
    Double getAverageResolutionTimeMinutes();

    /**
     * Trouver les alertes récurrentes (même entité, même type, dernières 24h)
     */
    @Query("SELECT a FROM Alert a WHERE a.entityType = :entityType AND a.entityId = :entityId " +
            "AND a.type = :type AND a.createdAt >= :since")
    List<Alert> findRecurringAlerts(
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("type") AlertType type,
            @Param("since") LocalDateTime since
    );

    /**
     * Supprimer les alertes anciennes résolues
     */
    @Query("DELETE FROM Alert a WHERE a.status = 'RESOLVED' AND a.resolvedAt < :cutoffDate")
    void deleteOldResolvedAlerts(@Param("cutoffDate") LocalDateTime cutoffDate);
}
