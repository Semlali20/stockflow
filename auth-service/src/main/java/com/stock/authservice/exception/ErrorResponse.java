package com.stock.authservice.exception;

import java.time.LocalDateTime;
import java.util.Map;

@lombok.Data
@lombok.Builder
class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private Map<String, String> validationErrors;
}
