package com.stock.qualityservice.exception;

/**
 * Exception thrown when a revelation is not found
 */
public class RevelationNotFoundException extends RuntimeException {

    public RevelationNotFoundException(String id) {
        super("Revelation not found with ID: " + id);
    }
}
