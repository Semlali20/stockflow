package com.stock.qualityservice.exception;

public class QuarantineAlreadyReleasedException extends QualityServiceException {

    public QuarantineAlreadyReleasedException(String quarantineId) {
        super(String.format("Quarantine '%s' has already been released and cannot be modified", quarantineId));
    }
}