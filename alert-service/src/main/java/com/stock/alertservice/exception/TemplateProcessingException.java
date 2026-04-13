package com.stock.alertservice.exception;

/**
 * Exception lancée lors d'une erreur de traitement de template
 */
public class TemplateProcessingException extends BusinessException {

    public TemplateProcessingException(String templateName, String message) {
        super(
                String.format("Error processing template '%s': %s", templateName, message),
                "TEMPLATE_PROCESSING_ERROR"
        );
    }

    public TemplateProcessingException(String templateName, Throwable cause) {
        super(
                String.format("Error processing template '%s': %s", templateName, cause.getMessage()),
                "TEMPLATE_PROCESSING_ERROR",
                cause
        );
    }

    public TemplateProcessingException(String message) {
        super(message, "TEMPLATE_PROCESSING_ERROR");
    }
}
