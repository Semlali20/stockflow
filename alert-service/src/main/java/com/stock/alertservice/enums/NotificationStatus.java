package com.stock.alertservice.enums;

/**
 * Statuts d'envoi des notifications
 */
public enum NotificationStatus {
    PENDING("En attente"),
    SENT("Envoyé"),
    DELIVERED("Délivré"),
    FAILED("Échec"),
    BOUNCED("Rejeté");

    private final String description;

    NotificationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
