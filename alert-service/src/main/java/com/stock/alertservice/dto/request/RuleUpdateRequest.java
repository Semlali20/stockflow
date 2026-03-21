package com.stock.alertservice.dto.request;

import com.stock.alertservice.enums.Frequency;
import com.stock.alertservice.enums.RuleSeverity;
import com.stock.alertservice.enums.RuleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleUpdateRequest {
    private String name;
    private String description;
    private String event;
    private RuleType ruleType;
    private Map<String, Object> configuration;
    private Map<String, Object> threshold;
    private RuleSeverity severity;
    private Frequency frequency;
    private Boolean isActive;
    private String evaluatedBy;
    private Boolean hasImmediateAction;
    private Boolean hasPreventiveAction;
    private Map<String, Object> actions;
}
