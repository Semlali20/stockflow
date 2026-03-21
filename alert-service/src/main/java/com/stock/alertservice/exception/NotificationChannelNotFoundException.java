package com.stock.alertservice.exception;

public class NotificationChannelNotFoundException extends ResourceNotFoundException {

    // Par ID
    public NotificationChannelNotFoundException(String channelId) {
        super("NotificationChannel", "id", channelId);
    }

    // Par field name et value
    public NotificationChannelNotFoundException(String fieldName, Object fieldValue) {
        super("NotificationChannel", fieldName, fieldValue);
    }
}
