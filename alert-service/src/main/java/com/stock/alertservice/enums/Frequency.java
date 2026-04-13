package com.stock.alertservice.enums;

/**
 * Fréquences d'évaluation des règles
 */
public enum Frequency {
    REALTIME("Temps réel"),
    HOURLY("Toutes les heures"),
    DAILY("Quotidien"),
    WEEKLY("Hebdomadaire"),
    MONTHLY("Mensuel");

    private final String description;

    Frequency(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
