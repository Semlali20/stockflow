package com.stock.authservice.exception;

public class ForbiddenException extends RuntimeException {

    public ForbiddenException() {
        super("Access forbidden");
    }

    public ForbiddenException(String message) {
        super(message);
    }
}
