package com.stock.alertservice.exception;

/**
 * Exception lancée quand un template de notification n'est pas trouvé
 */
public class NotificationTemplateNotFoundException extends ResourceNotFoundException {

    public NotificationTemplateNotFoundException(String templateId) {
        super("NotificationTemplate", "id", templateId);
    }

    public NotificationTemplateNotFoundException(String fieldName, Object fieldValue) {
        super("NotificationTemplate", fieldName, fieldValue);
    }


}
