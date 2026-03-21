package com.stock.alertservice.entity;

import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.enums.NotificationChannelType;
import jakarta.persistence.*;
import lombok.*;

import java.util.Map;

/**
 * Entité représentant un modèle de notification
 * Définit le format et le contenu des notifications
 */
@Entity
@Table(name = "notification_templates", indexes = {
        @Index(name = "idx_template_type_channel", columnList = "template_type, channel"),
        @Index(name = "idx_template_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate extends BaseEntity {

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Column(length = 200)
    private String subject;


    @Column(name = "total_notifications_sent")
    private Long totalNotificationsSent;
    @Column(name = "html_body", columnDefinition = "TEXT")
    private String htmlBody;

    /**
     * Corps du message en texte brut
     */
    @Column(name = "text_body", columnDefinition = "TEXT")
    private String textBody;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationChannelType channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", length = 50)
    private AlertType templateType;

    /**
     * Langue du template (pour i18n)
     */
    @Column(length = 10)
    @Builder.Default
    private String language = "en";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Variables requises dans le template
     * Ex: "userName,alertType,message"
     */
    @Column(name = "required_variables", length = 500)
    private String requiredVariables;

    // Méthodes métier
    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    /**
     * Remplace les variables dans le template
     */
    public String renderBody(Map<String, Object> variables) {
        String rendered = this.htmlBody != null ? this.htmlBody : this.textBody;

        if (rendered == null || variables == null) {
            return rendered;
        }

        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            rendered = rendered.replace(placeholder, value);
        }

        return rendered;
    }
}
