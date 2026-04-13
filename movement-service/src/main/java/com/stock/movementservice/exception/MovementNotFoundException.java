package com.stock.movementservice.exception;

import java.util.UUID;

public class MovementNotFoundException extends RuntimeException {
    public MovementNotFoundException(UUID id) {
        super("Movement not found with id: " + id);
    }

    public MovementNotFoundException(String referenceNumber) {
        super("Movement not found with reference number: " + referenceNumber);
    }

    public MovementNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
