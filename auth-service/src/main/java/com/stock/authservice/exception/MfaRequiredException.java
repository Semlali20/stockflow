package com.stock.authservice.exception;

public class MfaRequiredException extends RuntimeException {

    private final String tempToken;

    public MfaRequiredException(String tempToken) {
        super("MFA verification is required");
        this.tempToken = tempToken;
    }

    public MfaRequiredException(String message, String tempToken) {
        super(message);
        this.tempToken = tempToken;
    }

    public String getTempToken() {
        return tempToken;
    }
}
