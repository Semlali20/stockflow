package com.stock.movementservice.exception;

import java.util.UUID;

public class MovementLineNotFoundException extends RuntimeException {
    public MovementLineNotFoundException(UUID id) {
        super("Movement line not found with id: " + id);
    }

    public MovementLineNotFoundException(UUID movementId, Integer lineNumber) {
        super("Movement line not found with movement id: " + movementId + " and line number: " + lineNumber);
    }

    public MovementLineNotFoundException(String message) {
        super(message);
    }
}
