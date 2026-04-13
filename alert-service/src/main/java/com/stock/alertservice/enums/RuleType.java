package com.stock.alertservice.enums;

/**
 * Types de règles métier
 */
public enum RuleType {
    FEED_VIOLATION("Violation de règles d'alimentation"),
    DATAFLOW_RULE("Règle de flux de données"),
    MISFIT_RULE("Détection d'incohérences"),
    ALERT_SYSTEM("Règle système");

    private final String description;

    RuleType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
