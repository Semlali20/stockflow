package com.stock.alertservice.entity;

import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.enums.NotificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Entité représentant une notification envoyée
 * Historique de toutes les notifications avec leur statut
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_status", columnList = "status"),
        @Index(name = "idx_notification_channel", columnList = "channel_type"),
        @Index(name = "idx_notification_sent", columnList = "sent_at"),
        @Index(name = "idx_notification_recipient", columnList = "recipient")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "channel_type", nullable = false, length = 50)
    private NotificationChannelType channelType;

    @Column(nullable = false, length = 255)
    private String recipient;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    /**
     * Message d'erreur si échec
     */
    @Column(name = "error_message", length = 500)
    private String errorMessage;

    /**
     * Métadonnées supplémentaires (JSON)
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false)
    private Alert alert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private NotificationTemplate template;

    // Méthodes métier
    public void markAsSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }

    public void markAsDelivered() {
        this.status = NotificationStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }

    public void markAsFailed(String errorMessage) {
        this.status = NotificationStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    public void markAsBounced(String errorMessage) {
        this.status = NotificationStatus.BOUNCED;
        this.errorMessage = errorMessage;
    }

    public void incrementRetryCount() {
        this.retryCount++;
    }

    public boolean canRetry() {
        return this.retryCount < 3 &&
                (this.status == NotificationStatus.PENDING ||
                        this.status == NotificationStatus.FAILED);
    }
}
