package com.stock.qualityservice.exception;

import java.io.IOException;

public class FileUploadException extends QualityServiceException {

    public FileUploadException(String message) {
        super(message);
    }

    public FileUploadException(String message, Throwable cause) {
        super(message, cause);
    }

    // Constructor that accepts String, String, IOException
    public FileUploadException(String message, String fileName, IOException cause) {
        super(String.format("%s - File: %s", message, fileName), cause);
    }

    // Additional constructor for file-related errors
    public FileUploadException(String message, String fileName) {
        super(String.format("%s - File: %s", message, fileName));
    }
}