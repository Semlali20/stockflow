package com.stock.alertservice.enums;

/**
 * Niveaux de priorité des alertes
 */
public enum AlertLevel {
    INFO("Information", 1),
    WARNING("Avertissement", 2),
    EMERGENCY("Urgence", 3);

    private final String description;
    private final int priority;

    AlertLevel(String description, int priority) {
        this.description = description;
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public int getPriority() {
        return priority;
    }
}
