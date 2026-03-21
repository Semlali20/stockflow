package com.stock.alertservice.repository;

import com.stock.alertservice.entity.NotificationTemplate;
import com.stock.alertservice.enums.AlertType;
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
 * Repository pour la gestion des templates de notification
 */
@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, String> {

    /**
     * Trouver un template par nom
     */
    Optional<NotificationTemplate> findByName(String name);

    /**
     * Vérifier si un template existe avec ce nom
     */
    boolean existsByName(String name);

    /**
     * Trouver tous les templates actifs
     */
    List<NotificationTemplate> findByIsActiveTrue();

    /**
     * Trouver les templates par canal
     */
    List<NotificationTemplate> findByChannel(NotificationChannelType channel);

    /**
     * Trouver les templates actifs par canal
     */
    List<NotificationTemplate> findByChannelAndIsActiveTrue(NotificationChannelType channel);

    /**
     * Trouver les templates par type d'alerte
     */
    List<NotificationTemplate> findByTemplateType(AlertType templateType);

    /**
     * Trouver un template par type d'alerte et canal
     */
    Optional<NotificationTemplate> findByTemplateTypeAndChannel(
            AlertType templateType,
            NotificationChannelType channel
    );

    /**
     * Trouver un template actif par type et canal
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.templateType = :templateType " +
            "AND nt.channel = :channel AND nt.isActive = true")
    Optional<NotificationTemplate> findActiveTemplateByTypeAndChannel(
            @Param("templateType") AlertType templateType,
            @Param("channel") NotificationChannelType channel
    );

    /**
     * Trouver les templates par langue
     */
    List<NotificationTemplate> findByLanguage(String language);

    /**
     * Trouver les templates actifs par langue
     */
    List<NotificationTemplate> findByLanguageAndIsActiveTrue(String language);

    /**
     * Recherche de templates par nom
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE LOWER(nt.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<NotificationTemplate> searchByName(@Param("keyword") String keyword);

    /**
     * Trouver les templates avec pagination
     */
    Page<NotificationTemplate> findByIsActiveTrue(Pageable pageable);

    /**
     * Compter les templates actifs
     */
    long countByIsActiveTrue();

    /**
     * Compter les templates par canal
     */
    long countByChannel(NotificationChannelType channel);

    /**
     * Compter les templates par type
     */
    long countByTemplateType(AlertType templateType);

    /**
     * Recherche avancée de templates
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE " +
            "(:name IS NULL OR LOWER(nt.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:channel IS NULL OR nt.channel = :channel) AND " +
            "(:templateType IS NULL OR nt.templateType = :templateType) AND " +
            "(:language IS NULL OR nt.language = :language) AND " +
            "(:isActive IS NULL OR nt.isActive = :isActive)")
    Page<NotificationTemplate> searchTemplates(
            @Param("name") String name,
            @Param("channel") NotificationChannelType channel,
            @Param("templateType") AlertType templateType,
            @Param("language") String language,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
