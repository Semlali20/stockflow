package com.stock.alertservice.exception;

/**
 * Exception lancée quand une alerte n'est pas trouvée
 */
public class AlertNotFoundException extends ResourceNotFoundException {

    public AlertNotFoundException(String alertId) {
        super("Alert", "id", alertId);
    }

    public AlertNotFoundException(String message, String alertId) {
        super(String.format("%s: Alert ID = %s", message, alertId));
    }
}
