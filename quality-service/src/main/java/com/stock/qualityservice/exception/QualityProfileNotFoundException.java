package com.stock.qualityservice.exception;

public class QualityProfileNotFoundException extends ResourceNotFoundException {

    public QualityProfileNotFoundException(String profileId) {
        super("Quality Profile", "id", profileId);
    }

    public QualityProfileNotFoundException(String fieldName, Object fieldValue) {
        super("Quality Profile", fieldName, fieldValue);
    }
}