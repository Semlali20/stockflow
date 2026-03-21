package com.stock.qualityservice.exception;

public class QualityServiceException extends RuntimeException {

    public QualityServiceException(String message) {
        super(message);
    }

    public QualityServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}