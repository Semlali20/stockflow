package com.stock.movementservice.exception;

import java.util.UUID;

public class MovementTaskNotFoundException extends RuntimeException {
    public MovementTaskNotFoundException(UUID id) {
        super("Movement task not found with id: " + id);
    }

    public MovementTaskNotFoundException(String message) {
        super(message);
    }
}
