package com.stock.alertservice.dto.request;

import com.stock.alertservice.enums.Frequency;
import com.stock.alertservice.enums.RuleSeverity;
import com.stock.alertservice.enums.RuleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleCreateRequest {

    @NotBlank(message = "Rule name is required")
    private String name;

    private String description;

    @NotBlank(message = "Event type is required")
    private String event;

    private RuleType ruleType;

    @NotNull(message = "Configuration is required")
    private Map<String, Object> configuration;

    private Map<String, Object> threshold;

    @NotNull(message = "Severity is required")
    private RuleSeverity severity;

    @NotNull(message = "Frequency is required")
    private Frequency frequency;

    private Boolean isActive;
    private String evaluatedBy;
    private Boolean hasImmediateAction;
    private Boolean hasPreventiveAction;
    private Map<String, Object> actions;
}
