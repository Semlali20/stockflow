package com.stock.alertservice.repository;

import com.stock.alertservice.entity.Rule;
import com.stock.alertservice.enums.Frequency;
import com.stock.alertservice.enums.RuleSeverity;
import com.stock.alertservice.enums.RuleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des règles métier
 */
@Repository
public interface RuleRepository extends JpaRepository<Rule, String> {

    /**
     * Trouver une règle par son nom
     */
    Optional<Rule> findByName(String name);

    /**
     * Vérifier si une règle existe avec ce nom
     */
    boolean existsByName(String name);

    /**
     * Trouver toutes les règles actives
     */
    List<Rule> findByIsActiveTrue();

    /**
     * Trouver toutes les règles inactives
     */
    List<Rule> findByIsActiveFalse();

    /**
     * Trouver les règles par type d'événement
     */
    List<Rule> findByEvent(String event);

    /**
     * Trouver les règles actives par type d'événement
     */
    @Query("SELECT r FROM Rule r WHERE r.isActive = true AND r.event = :event")
    List<Rule> findActiveRulesByEvent(@Param("event") String event);

    /**
     * Trouver les règles par niveau de gravité
     */
    List<Rule> findBySeverity(RuleSeverity severity);

    /**
     * Trouver les règles par type
     */
    List<Rule> findByRuleType(RuleType ruleType);

    /**
     * Trouver les règles par fréquence
     */
    List<Rule> findByFrequency(Frequency frequency);

    /**
     * Trouver les règles avec action immédiate
     */
    List<Rule> findByHasImmediateActionTrue();

    /**
     * Trouver les règles avec action préventive
     */
    List<Rule> findByHasPreventiveActionTrue();

    /**
     * Recherche de règles par nom (LIKE)
     */
    @Query("SELECT r FROM Rule r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Rule> searchByName(@Param("keyword") String keyword);

    /**
     * Trouver les règles actives avec pagination
     */
    Page<Rule> findByIsActiveTrue(Pageable pageable);

    /**
     * Trouver les règles par gravité avec pagination
     */
    Page<Rule> findBySeverity(RuleSeverity severity, Pageable pageable);

    /**
     * Compter les règles actives
     */
    long countByIsActiveTrue();

    /**
     * Compter les règles par gravité
     */
    long countBySeverity(RuleSeverity severity);

    /**
     * Trouver les règles qui doivent être évaluées par cron
     */
    @Query("SELECT r FROM Rule r WHERE r.isActive = true AND r.evaluatedBy LIKE 'CRON:%'")
    List<Rule> findActiveRulesWithCronEvaluation();

    /**
     * Trouver les règles évaluées par ML
     */
    @Query("SELECT r FROM Rule r WHERE r.isActive = true AND r.evaluatedBy LIKE 'ML:%'")
    List<Rule> findActiveRulesWithMLEvaluation();

    /**
     * Recherche avancée de règles
     */
    @Query("SELECT r FROM Rule r WHERE " +
            "(:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:event IS NULL OR r.event = :event) AND " +
            "(:severity IS NULL OR r.severity = :severity) AND " +
            "(:isActive IS NULL OR r.isActive = :isActive)")
    Page<Rule> searchRules(
            @Param("name") String name,
            @Param("event") String event,
            @Param("severity") RuleSeverity severity,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    /**
     * Obtenir les statistiques des règles
     */
    @Query("SELECT r.severity, COUNT(r) FROM Rule r GROUP BY r.severity")
    List<Object[]> getRuleStatisticsBySeverity();

    /**
     * Obtenir le nombre de règles par type
     */
    @Query("SELECT r.ruleType, COUNT(r) FROM Rule r GROUP BY r.ruleType")
    List<Object[]> getRuleStatisticsByType();
}
