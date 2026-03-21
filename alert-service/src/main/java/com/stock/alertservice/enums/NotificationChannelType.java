package com.stock.alertservice.enums;

/**
 * Types de canaux de notification
 */
public enum NotificationChannelType {
    EMAIL("Email"),
    SMS("SMS"),
    WEBHOOK("Webhook API"),
    PUSH("Notification Push"),
    BLACK("Désactivé");

    private final String description;

    NotificationChannelType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
