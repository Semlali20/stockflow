package com.stock.alertservice.enums;

/**
 * Types d'alertes dans le système
 */
public enum AlertType {
    LOW_STOCK("Stock faible"),
    OVERSTOCK("Surstock"),
    EXPIRY("Expiration proche"),
    QUALITY("Problème qualité"),
    LOCATION("Problème emplacement"),
    MOVEMENT("Anomalie mouvement"),
    SYSTEM("Erreur système");

    private final String description;

    AlertType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
