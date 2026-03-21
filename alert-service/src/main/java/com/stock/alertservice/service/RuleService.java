package com.stock.alertservice.service;

import com.stock.alertservice.dto.request.RuleCreateRequest;
import com.stock.alertservice.dto.request.RuleUpdateRequest;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.dto.response.RuleResponse;
import com.stock.alertservice.enums.Frequency;
import com.stock.alertservice.enums.RuleSeverity;
import com.stock.alertservice.enums.RuleType;

import java.util.List;

/**
 * Service pour la gestion des règles d'alerte
 */
public interface RuleService {

    /**
     * Créer une nouvelle règle
     */
    RuleResponse createRule(RuleCreateRequest request);

    /**
     * Récupérer une règle par ID
     */
    RuleResponse getRuleById(String id);

    /**
     * Récupérer une règle par nom
     */
    RuleResponse getRuleByName(String name);

    /**
     * Mettre à jour une règle
     */
    RuleResponse updateRule(String id, RuleUpdateRequest request);

    /**
     * Supprimer une règle
     */
    void deleteRule(String id);

    /**
     * Activer une règle
     */
    RuleResponse activateRule(String id);

    /**
     * Désactiver une règle
     */
    RuleResponse deactivateRule(String id);

    /**
     * Récupérer toutes les règles avec pagination
     */
    PageResponse<RuleResponse> getAllRules(int page, int size, String sortBy, String sortDirection);

    /**
     * Récupérer toutes les règles actives
     */
    List<RuleResponse> getActiveRules();

    /**
     * Récupérer les règles par événement
     */
    List<RuleResponse> getRulesByEvent(String event);

    /**
     * Récupérer les règles actives par événement
     */
    List<RuleResponse> getActiveRulesByEvent(String event);

    /**
     * Récupérer les règles par gravité
     */
    List<RuleResponse> getRulesBySeverity(RuleSeverity severity);

    /**
     * Récupérer les règles par type
     */
    List<RuleResponse> getRulesByType(RuleType ruleType);

    /**
     * Récupérer les règles par fréquence
     */
    List<RuleResponse> getRulesByFrequency(Frequency frequency);

    /**
     * Rechercher des règles
     */
    PageResponse<RuleResponse> searchRules(
            String name,
            String event,
            RuleSeverity severity,
            Boolean isActive,
            int page,
            int size
    );

    /**
     * Obtenir les statistiques des règles
     */
    Object getRuleStatistics();
}
