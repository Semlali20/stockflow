package com.stock.qualityservice.exception;

public class QuarantineNotFoundException extends ResourceNotFoundException {

    public QuarantineNotFoundException(String quarantineId) {
        super("Quarantine", "id", quarantineId);
    }

    public QuarantineNotFoundException(String fieldName, Object fieldValue) {
        super("Quarantine", fieldName, fieldValue);
    }
}