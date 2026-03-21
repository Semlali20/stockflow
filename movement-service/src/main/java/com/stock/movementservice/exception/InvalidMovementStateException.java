package com.stock.movementservice.exception;

import com.stock.movementservice.entity.enums.MovementStatus;

import java.util.UUID;

public class InvalidMovementStateException extends RuntimeException {
    public InvalidMovementStateException(UUID movementId, MovementStatus currentStatus, String operation) {
        super("Cannot perform operation '" + operation + "' on movement " + movementId +
                " with current status: " + currentStatus);
    }

    public InvalidMovementStateException(String message) {
        super(message);
    }
}
