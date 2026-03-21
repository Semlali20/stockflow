package com.stock.authservice.exception;

public class AccountDisabledException extends RuntimeException {

    public AccountDisabledException() {
        super("Account is disabled");
    }

    public AccountDisabledException(String message) {
        super(message);
    }
}
