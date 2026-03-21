package com.stock.alertservice.entity;

import com.stock.alertservice.enums.Frequency;
import com.stock.alertservice.enums.RuleSeverity;
import com.stock.alertservice.enums.RuleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Entité représentant une règle métier
 * Une règle définit les conditions pour déclencher des alertes
 */
@Entity
@Table(name = "rules", indexes = {
        @Index(name = "idx_rule_name", columnList = "name"),
        @Index(name = "idx_rule_event", columnList = "event"),
        @Index(name = "idx_rule_severity", columnList = "severity"),
        @Index(name = "idx_rule_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rule extends BaseEntity {

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 50)
    private String event; // Type d'événement déclencheur (ex: INVENTORY_LEVEL_CHANGE)

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", length = 50)
    private RuleType ruleType;

    /**
     * Configuration JSON contenant les conditions de déclenchement
     * Exemple: {"itemId": "uuid", "operator": "LESS_THAN", "threshold": 10}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> configuration = new HashMap<>();


    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> threshold = new HashMap<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RuleSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Frequency frequency = Frequency.REALTIME;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "total_alerts_generated")
    private Long totalAlertsGenerated;

    @Column(name = "active_alerts_count")
    private Long activeAlertsCount;
    @Column(name = "evaluated_by", length = 100)
    private String evaluatedBy;

    @Column(name = "has_immediate_action")
    @Builder.Default
    private Boolean hasImmediateAction = false;

    @Column(name = "has_preventive_action")
    @Builder.Default
    private Boolean hasPreventiveAction = false;

    /**
     * Actions à exécuter lorsque la règle est déclenchée
     * Exemple: {"immediate": "SEND_ALERT", "preventive": "AUTO_REORDER"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> actions = new HashMap<>();

    // Relations
    @OneToMany(mappedBy = "rule", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Alert> alerts = new ArrayList<>();

    // Helper methods
    public void addAlert(Alert alert) {
        alerts.add(alert);
        alert.setRule(this);
    }

    public void removeAlert(Alert alert) {
        alerts.remove(alert);
        alert.setRule(null);
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
