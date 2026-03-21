package com.stock.movementservice.exception;

import java.util.List;

public class MovementValidationException extends RuntimeException {
    private List<String> validationErrors;

    public MovementValidationException(String message) {
        super(message);
    }

    public MovementValidationException(String message, List<String> validationErrors) {
        super(message);
        this.validationErrors = validationErrors;
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }
}
