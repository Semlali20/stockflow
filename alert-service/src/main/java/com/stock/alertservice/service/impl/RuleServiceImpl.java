package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.request.RuleCreateRequest;
import com.stock.alertservice.dto.request.RuleUpdateRequest;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.dto.response.RuleResponse;
import com.stock.alertservice.entity.Rule;
import com.stock.alertservice.enums.Frequency;
import com.stock.alertservice.enums.RuleSeverity;
import com.stock.alertservice.enums.RuleType;
import com.stock.alertservice.exception.DuplicateRuleException;
import com.stock.alertservice.exception.RuleNotFoundException;
import com.stock.alertservice.repository.RuleRepository;
import com.stock.alertservice.service.RuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RuleServiceImpl implements RuleService {

    private final RuleRepository ruleRepository;

    @Override
    public RuleResponse createRule(RuleCreateRequest request) {
        log.info("Creating new rule: {}", request.getName());

        // Vérifier si une règle avec ce nom existe déjà
        if (ruleRepository.existsByName(request.getName())) {
            throw new DuplicateRuleException(request.getName());
        }

        Rule rule = Rule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .event(request.getEvent())
                .ruleType(request.getRuleType())
                .configuration(request.getConfiguration())
                .threshold(request.getThreshold())
                .severity(request.getSeverity())
                .frequency(request.getFrequency())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .evaluatedBy(request.getEvaluatedBy())
                .hasImmediateAction(request.getHasImmediateAction() != null ? request.getHasImmediateAction() : false)
                .hasPreventiveAction(request.getHasPreventiveAction() != null ? request.getHasPreventiveAction() : false)
                .actions(request.getActions())
                .totalAlertsGenerated(0L)
                .activeAlertsCount(0L)
                .build();

        Rule savedRule = ruleRepository.save(rule);
        log.info("Rule created successfully with ID: {}", savedRule.getId());

        return mapToResponse(savedRule);
    }

    @Override
    @Transactional(readOnly = true)
    public RuleResponse getRuleById(String id) {
        log.info("Fetching rule by ID: {}", id);

        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuleNotFoundException(id));

        return mapToResponse(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public RuleResponse getRuleByName(String name) {
        log.info("Fetching rule by name: {}", name);

        Rule rule = ruleRepository.findByName(name)
                .orElseThrow(() -> new RuleNotFoundException("name", name));

        return mapToResponse(rule);
    }

    @Override
    public RuleResponse updateRule(String id, RuleUpdateRequest request) {
        log.info("Updating rule with ID: {}", id);

        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuleNotFoundException(id));

        // Vérifier si le nouveau nom existe déjà
        if (request.getName() != null && !request.getName().equals(rule.getName())) {
            if (ruleRepository.existsByName(request.getName())) {
                throw new DuplicateRuleException(request.getName());
            }
            rule.setName(request.getName());
        }

        if (request.getDescription() != null) {
            rule.setDescription(request.getDescription());
        }
        if (request.getEvent() != null) {
            rule.setEvent(request.getEvent());
        }
        if (request.getRuleType() != null) {
            rule.setRuleType(request.getRuleType());
        }
        if (request.getConfiguration() != null) {
            rule.setConfiguration(request.getConfiguration());
        }
        if (request.getThreshold() != null) {
            rule.setThreshold(request.getThreshold());
        }
        if (request.getSeverity() != null) {
            rule.setSeverity(request.getSeverity());
        }
        if (request.getFrequency() != null) {
            rule.setFrequency(request.getFrequency());
        }
        if (request.getIsActive() != null) {
            rule.setIsActive(request.getIsActive());
        }
        if (request.getEvaluatedBy() != null) {
            rule.setEvaluatedBy(request.getEvaluatedBy());
        }
        if (request.getHasImmediateAction() != null) {
            rule.setHasImmediateAction(request.getHasImmediateAction());
        }
        if (request.getHasPreventiveAction() != null) {
            rule.setHasPreventiveAction(request.getHasPreventiveAction());
        }
        if (request.getActions() != null) {
            rule.setActions(request.getActions());
        }

        Rule updatedRule = ruleRepository.save(rule);
        log.info("Rule updated successfully: {}", id);

        return mapToResponse(updatedRule);
    }

    @Override
    public void deleteRule(String id) {
        log.info("Deleting rule with ID: {}", id);

        if (!ruleRepository.existsById(id)) {
            throw new RuleNotFoundException(id);
        }

        ruleRepository.deleteById(id);
        log.info("Rule deleted successfully: {}", id);
    }

    @Override
    public RuleResponse activateRule(String id) {
        log.info("Activating rule with ID: {}", id);

        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuleNotFoundException(id));

        rule.setIsActive(true);
        Rule updatedRule = ruleRepository.save(rule);

        log.info("Rule activated successfully: {}", id);
        return mapToResponse(updatedRule);
    }

    @Override
    public RuleResponse deactivateRule(String id) {
        log.info("Deactivating rule with ID: {}", id);

        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuleNotFoundException(id));

        rule.setIsActive(false);
        Rule updatedRule = ruleRepository.save(rule);

        log.info("Rule deactivated successfully: {}", id);
        return mapToResponse(updatedRule);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RuleResponse> getAllRules(int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching all rules - page: {}, size: {}", page, size);

        Sort sort = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Rule> rulePage = ruleRepository.findAll(pageable);

        List<RuleResponse> content = rulePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, rulePage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RuleResponse> getActiveRules() {
        log.info("Fetching all active rules");

        return ruleRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RuleResponse> getRulesByEvent(String event) {
        log.info("Fetching rules by event: {}", event);

        return ruleRepository.findByEvent(event).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RuleResponse> getActiveRulesByEvent(String event) {
        log.info("Fetching active rules by event: {}", event);

        return ruleRepository.findActiveRulesByEvent(event).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RuleResponse> getRulesBySeverity(RuleSeverity severity) {
        log.info("Fetching rules by severity: {}", severity);

        return ruleRepository.findBySeverity(severity).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RuleResponse> getRulesByType(RuleType ruleType) {
        log.info("Fetching rules by type: {}", ruleType);

        return ruleRepository.findByRuleType(ruleType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RuleResponse> getRulesByFrequency(Frequency frequency) {
        log.info("Fetching rules by frequency: {}", frequency);

        return ruleRepository.findByFrequency(frequency).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RuleResponse> searchRules(
            String name,
            String event,
            RuleSeverity severity,
            Boolean isActive,
            int page,
            int size) {

        log.info("Searching rules with filters");

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Rule> rulePage = ruleRepository.searchRules(name, event, severity, isActive, pageable);

        List<RuleResponse> content = rulePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, rulePage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Object getRuleStatistics() {
        log.info("Fetching rule statistics");

        Map<String, Object> statistics = new HashMap<>();

        // Statistiques de base
        statistics.put("totalRules", ruleRepository.count());
        statistics.put("activeRules", ruleRepository.countByIsActiveTrue());

        // Statistiques par gravité
        List<Object[]> severityStats = ruleRepository.getRuleStatisticsBySeverity();
        Map<String, Long> bySeverity = new HashMap<>();
        severityStats.forEach(stat -> {
            bySeverity.put(stat[0].toString(), (Long) stat[1]);
        });
        statistics.put("bySeverity", bySeverity);

        // Statistiques par type
        List<Object[]> typeStats = ruleRepository.getRuleStatisticsByType();
        Map<String, Long> byType = new HashMap<>();
        typeStats.forEach(stat -> {
            byType.put(stat[0].toString(), (Long) stat[1]);
        });
        statistics.put("byType", byType);

        return statistics;
    }

    /**
     * Mapper une entité Rule vers RuleResponse
     */
    private RuleResponse mapToResponse(Rule rule) {
        return RuleResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .event(rule.getEvent())
                .ruleType(rule.getRuleType())
                .configuration(rule.getConfiguration())
                .threshold(rule.getThreshold())
                .severity(rule.getSeverity())
                .frequency(rule.getFrequency())
                .isActive(rule.getIsActive())
                .evaluatedBy(rule.getEvaluatedBy())
                .hasImmediateAction(rule.getHasImmediateAction())
                .hasPreventiveAction(rule.getHasPreventiveAction())
                .actions(rule.getActions())
                .totalAlertsGenerated(rule.getTotalAlertsGenerated())
                .activeAlertsCount(rule.getActiveAlertsCount())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }
}
