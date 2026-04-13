package com.stock.alertservice.entity;

import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertStatus;
import com.stock.alertservice.enums.AlertType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Entité représentant une alerte générée
 * Une alerte est créée lorsqu'une règle est violée
 */
@Entity
@Table(name = "alerts", indexes = {
        @Index(name = "idx_alert_type", columnList = "type"),
        @Index(name = "idx_alert_level", columnList = "level"),
        @Index(name = "idx_alert_status", columnList = "status"),
        @Index(name = "idx_alert_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_alert_created", columnList = "created_at"),
        @Index(name = "idx_alert_acknowledged", columnList = "acknowledged")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AlertType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AlertLevel level;

    /**
     * Type de l'entité concernée (ex: ITEM, LOCATION, MOVEMENT)
     */
    @Column(name = "entity_type", length = 50)
    private String entityType;

    /**
     * ID de l'entité concernée
     */
    @Column(name = "entity_id", length = 36)
    private String entityId;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private AlertStatus status = AlertStatus.ACTIVE;

    /**
     * Données contextuelles de l'alerte (JSON)
     * Exemple: {"currentStock": 5, "threshold": 10, "location": "A1-B2"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> data = new HashMap<>();

    // Gestion du cycle de vie
    @Column(name = "acknowledged_by", length = 36)
    private String acknowledgedBy;

    @Column(name = "resolved_by", length = 36)
    private String resolvedBy;

    @Column(name = "acknowledged")
    @Builder.Default
    private Boolean acknowledged = false;

    @Column(name = "resolved")
    @Builder.Default
    private Boolean resolved = false;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // Escalade
    @Column(name = "escalation_level")
    @Builder.Default
    private Integer escalationLevel = 0;

    /**
     * Compteur pour déduplication des alertes récurrentes
     */
    @Column(name = "recurring_daily_count")
    @Builder.Default
    private Integer recurringDailyCount = 0;

    @Column(name = "last_recurrence_at")
    private LocalDateTime lastRecurrenceAt;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private Rule rule;

    @OneToMany(mappedBy = "alert", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    // Méthodes métier
    public void acknowledge(String userId) {
        this.acknowledged = true;
        this.acknowledgedBy = userId;
        this.respondedAt = LocalDateTime.now();
        this.status = AlertStatus.ACKNOWLEDGED;
    }

    public void resolve(String userId) {
        this.resolved = true;
        this.resolvedBy = userId;
        this.resolvedAt = LocalDateTime.now();
        this.status = AlertStatus.RESOLVED;
    }

    public void escalate() {
        this.escalationLevel++;
        this.status = AlertStatus.ESCALATED;
    }

    public void incrementRecurrence() {
        this.recurringDailyCount++;
        this.lastRecurrenceAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return this.status == AlertStatus.ACTIVE;
    }

    public boolean requiresEscalation(int hoursThreshold) {
        if (!isActive() || acknowledged) {
            return false;
        }
        LocalDateTime threshold = LocalDateTime.now().minusHours(hoursThreshold);
        return this.getCreatedAt().isBefore(threshold);
    }

    // Helper methods pour les relations
    public void addNotification(Notification notification) {
        notifications.add(notification);
        notification.setAlert(this);
    }

    public void removeNotification(Notification notification) {
        notifications.remove(notification);
        notification.setAlert(null);
    }
}
