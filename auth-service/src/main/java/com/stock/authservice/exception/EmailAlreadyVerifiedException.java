package com.stock.authservice.exception;

public class EmailAlreadyVerifiedException extends RuntimeException {

    public EmailAlreadyVerifiedException() {
        super("Email is already verified");
    }

    public EmailAlreadyVerifiedException(String message) {
        super(message);
    }
}
