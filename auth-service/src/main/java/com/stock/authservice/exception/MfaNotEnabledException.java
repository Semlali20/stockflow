package com.stock.authservice.exception;

public class MfaNotEnabledException extends RuntimeException {

    public MfaNotEnabledException() {
        super("MFA is not enabled for this user");
    }

    public MfaNotEnabledException(String message) {
        super(message);
    }
}
