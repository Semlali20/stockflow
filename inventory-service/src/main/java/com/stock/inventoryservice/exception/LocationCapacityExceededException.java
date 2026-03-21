package com.stock.inventoryservice.exception;

/**
 * Exception thrown when inventory quantity exceeds location capacity
 */
public class LocationCapacityExceededException extends RuntimeException {

    public LocationCapacityExceededException(String message) {
        super(message);
    }

    public LocationCapacityExceededException(String message, Throwable cause) {
        super(message, cause);
    }
}
