package com.stock.qualityservice.exception;

public class InvalidFileTypeException extends QualityServiceException {

    public InvalidFileTypeException(String fileType, String allowedTypes) {
        super(String.format(
                "Invalid file type '%s'. Allowed types: %s",
                fileType, allowedTypes
        ));
    }

    public InvalidFileTypeException(String message) {
        super(message);
    }
}