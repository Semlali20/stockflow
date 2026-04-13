package com.stock.alertservice.exception;

/**
 * Exception lancée quand une notification n'est pas trouvée
 */
public class NotificationNotFoundException extends ResourceNotFoundException {

    public NotificationNotFoundException(String notificationId) {
        super("Notification", "id", notificationId);
    }


}
