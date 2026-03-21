package com.stock.qualityservice.exception;

public class InsufficientQuantityException extends QualityServiceException {

    public InsufficientQuantityException(String itemId, Double requested, Double available) {
        super(String.format(
                "Insufficient quantity for item '%s'. Requested: %.2f, Available: %.2f",
                itemId, requested, available
        ));
    }

    public InsufficientQuantityException(String message) {
        super(message);
    }
}