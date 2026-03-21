package com.stock.alertservice.enums;

/**
 * États du cycle de vie d'une alerte
 */
public enum AlertStatus {
    ACTIVE("Active - En attente d'action"),
    ACKNOWLEDGED("Prise en compte"),
    RESOLVED("Résolue"),
    ESCALATED("Escaladée");

    private final String description;

    AlertStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
