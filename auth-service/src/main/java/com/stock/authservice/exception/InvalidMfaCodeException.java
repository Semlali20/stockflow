package com.stock.authservice.exception;

public class InvalidMfaCodeException extends RuntimeException {

    public InvalidMfaCodeException() {
        super("Invalid MFA code");
    }

    public InvalidMfaCodeException(String message) {
        super(message);
    }
}
