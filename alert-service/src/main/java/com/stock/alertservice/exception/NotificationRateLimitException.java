package com.stock.alertservice.exception;

/**
 * Exception lancée quand le rate limit des notifications est dépassé
 */
public class NotificationRateLimitException extends BusinessException {

    public NotificationRateLimitException(String channelName, int limit) {
        super(
                String.format("Notification rate limit exceeded for channel '%s'. Limit: %d per hour",
                        channelName, limit),
                "RATE_LIMIT_EXCEEDED"
        );
    }

    public NotificationRateLimitException(String message) {
        super(message, "RATE_LIMIT_EXCEEDED");
    }
}
