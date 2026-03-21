package com.stock.movementservice.exception;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * 🔥 Exception thrown when there is insufficient stock for a movement
 */
@Getter
public class InsufficientStockException extends RuntimeException {

    private final List<String> errors;

    public InsufficientStockException(String message) {
        super(message);
        this.errors = new ArrayList<>();
        this.errors.add(message);
    }

    public InsufficientStockException(String message, List<String> errors) {
        super(message);
        this.errors = errors;
    }

    public InsufficientStockException(String message, Throwable cause) {
        super(message, cause);
        this.errors = new ArrayList<>();
        this.errors.add(message);
    }
}
