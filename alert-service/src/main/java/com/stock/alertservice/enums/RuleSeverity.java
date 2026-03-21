package com.stock.alertservice.enums;

/**
 * Niveaux de gravité des règles
 */
public enum RuleSeverity {
    LOW_STOCK("Stock critique"),
    OVERSTOCK("Surstock"),
    NEAR_EXPIRY("Expiration proche"),
    LOCATION_VIOLATION("Violation d'emplacement"),
    QUALITY_ISSUE("Problème qualité"),
    SYSTEM_ERROR("Erreur système");

    private final String description;

    RuleSeverity(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
