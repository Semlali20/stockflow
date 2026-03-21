package com.stock.authservice.exception;

import java.util.List;

public class PasswordValidationException extends RuntimeException {

    private final List<String> validationErrors;

    public PasswordValidationException(List<String> validationErrors) {
        super("Password does not meet requirements");
        this.validationErrors = validationErrors;
    }

    public PasswordValidationException(String message, List<String> validationErrors) {
        super(message);
        this.validationErrors = validationErrors;
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }
}
