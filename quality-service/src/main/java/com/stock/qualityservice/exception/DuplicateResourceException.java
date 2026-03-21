package com.stock.qualityservice.exception;

public class DuplicateResourceException extends QualityServiceException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceType, String fieldName, Object fieldValue) {
        super(String.format("Duplicate %s found with %s: '%s'", resourceType, fieldName, fieldValue));
    }
}