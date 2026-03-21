package com.stock.movementservice.exception;

import java.util.UUID;

public class InsufficientInventoryException extends RuntimeException {
    public InsufficientInventoryException(UUID itemId, UUID locationId, Double requested, Double available) {
        super("Insufficient inventory for item " + itemId + " at location " + locationId +
                ". Requested: " + requested + ", Available: " + available);
    }

    public InsufficientInventoryException(String message) {
        super(message);
    }
}
