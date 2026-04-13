package com.stock.alertservice.entity;

import com.stock.alertservice.enums.NotificationChannelType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

/**
 * Entité représentant un canal de notification
 * Configure les paramètres d'envoi pour chaque type de canal
 */
@Entity
@Table(name = "notification_channels", indexes = {
        @Index(name = "idx_channel_type", columnList = "channel_type"),
        @Index(name = "idx_channel_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationChannel extends BaseEntity {

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel_type", nullable = false, length = 50)
    private NotificationChannelType channelType;

    @Column(name = "total_notifications_sent")
    private Long totalNotificationsSent;

    @Column(name = "successful_notifications")
    private Long successfulNotifications;

    @Column(name = "failed_notifications")
    private Long failedNotifications;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> settings = new HashMap<>();

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Limite de notifications par heure (rate limiting)
     */
    @Column(name = "rate_limit_per_hour")
    private Integer rateLimitPerHour;

    /**
     * Priorité du canal (1 = haute priorité)
     */
    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 5;

    // Méthodes métier
    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public boolean canSendNotification(int sentInLastHour) {
        if (!isActive) {
            return false;
        }
        if (rateLimitPerHour == null) {
            return true;
        }
        return sentInLastHour < rateLimitPerHour;
    }
}
