package com.stock.authservice.exception;

public class TokenInvalidException extends RuntimeException {

    public TokenInvalidException() {
        super("Invalid token");
    }

    public TokenInvalidException(String message) {
        super(message);
    }
}
