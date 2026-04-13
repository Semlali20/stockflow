package com.stock.alertservice.repository;

import com.stock.alertservice.entity.NotificationChannel;
import com.stock.alertservice.enums.NotificationChannelType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des canaux de notification
 */
@Repository
public interface NotificationChannelRepository extends JpaRepository<NotificationChannel, String> {

    /**
     * Trouver un canal par nom
     */
    Optional<NotificationChannel> findByName(String name);

    /**
     * Vérifier si un canal existe avec ce nom
     */
    boolean existsByName(String name);

    /**
     * Trouver tous les canaux actifs
     */
    List<NotificationChannel> findByIsActiveTrue();

    /**
     * Trouver les canaux par type
     */
    List<NotificationChannel> findByChannelType(NotificationChannelType channelType);

    /**
     * Trouver les canaux actifs par type
     */
    List<NotificationChannel> findByChannelTypeAndIsActiveTrue(NotificationChannelType channelType);

    /**
     * Trouver un canal actif par type (par ordre de priorité)
     */
    @Query("SELECT nc FROM NotificationChannel nc WHERE nc.channelType = :channelType " +
            "AND nc.isActive = true ORDER BY nc.priority ASC")
    List<NotificationChannel> findActiveChannelsByTypeOrderedByPriority(
            @Param("channelType") NotificationChannelType channelType
    );

    /**
     * Trouver le canal actif avec la plus haute priorité pour un type donné
     * FIXED: Changed return type from Optional to List to work with Pageable
     */
    @Query("SELECT nc FROM NotificationChannel nc WHERE nc.channelType = :channelType " +
            "AND nc.isActive = true ORDER BY nc.priority ASC")
    List<NotificationChannel> findTopPriorityActiveChannelByType(
            @Param("channelType") NotificationChannelType channelType,
            Pageable pageable
    );

    /**
     * Alternative: Find top priority channel without Pageable (simpler approach)
     */
    Optional<NotificationChannel> findFirstByChannelTypeAndIsActiveTrueOrderByPriorityAsc(
            NotificationChannelType channelType
    );

    /**
     * Recherche de canaux par nom
     */
    @Query("SELECT nc FROM NotificationChannel nc WHERE LOWER(nc.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<NotificationChannel> searchByName(@Param("keyword") String keyword);

    /**
     * Trouver les canaux avec pagination
     */
    Page<NotificationChannel> findByIsActiveTrue(Pageable pageable);

    /**
     * Compter les canaux actifs
     */
    long countByIsActiveTrue();

    /**
     * Compter les canaux par type
     */
    long countByChannelType(NotificationChannelType channelType);

    /**
     * Recherche avancée de canaux
     */
    @Query("SELECT nc FROM NotificationChannel nc WHERE " +
            "(:name IS NULL OR LOWER(nc.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:channelType IS NULL OR nc.channelType = :channelType) AND " +
            "(:isActive IS NULL OR nc.isActive = :isActive)")
    Page<NotificationChannel> searchChannels(
            @Param("name") String name,
            @Param("channelType") NotificationChannelType channelType,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}