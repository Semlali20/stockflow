package com.stock.authservice.exception;

public class MfaAlreadyEnabledException extends RuntimeException {

    public MfaAlreadyEnabledException() {
        super("MFA is already enabled for this user");
    }

    public MfaAlreadyEnabledException(String message) {
        super(message);
    }
}
