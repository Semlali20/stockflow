package com.stock.qualityservice.exception;

/**
 * Exception thrown when attempting to create a revelation with a duplicate name
 */
public class DuplicateRevelationException extends RuntimeException {

    public DuplicateRevelationException(String name) {
        super("Revelation with name '" + name + "' already exists");
    }
}
