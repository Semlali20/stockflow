package com.stock.movementservice.exception;

public class DuplicateReferenceNumberException extends RuntimeException {
    public DuplicateReferenceNumberException(String referenceNumber) {
        super("Movement with reference number '" + referenceNumber + "' already exists");
    }

    public DuplicateReferenceNumberException(String message, Throwable cause) {
        super(message, cause);
    }
}
