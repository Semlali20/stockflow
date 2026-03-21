package com.stock.alertservice.exception;

/**
 * Exception lancée quand une opération sur une alerte n'est pas valide dans son état actuel
 */
public class InvalidAlertStateException extends BusinessException {

    public InvalidAlertStateException(String message) {
        super(message, "INVALID_ALERT_STATE");
    }

    public InvalidAlertStateException(String alertId, String currentState, String operation) {
        super(
                String.format("Cannot perform '%s' on alert '%s' in state '%s'",
                        operation, alertId, currentState),
                "INVALID_ALERT_STATE"
        );
    }
}
