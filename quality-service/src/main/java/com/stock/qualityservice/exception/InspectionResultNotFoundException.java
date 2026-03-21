package com.stock.qualityservice.exception;

/**
 * Exception thrown when an inspection result is not found
 */
public class InspectionResultNotFoundException extends RuntimeException {

    public InspectionResultNotFoundException(String id) {
        super("Inspection Result not found with ID: " + id);
    }
}
