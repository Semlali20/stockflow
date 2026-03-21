package com.stock.qualityservice.exception;

public class DuplicateQuarantineException extends QualityServiceException {

    public DuplicateQuarantineException(String itemId, String lotId) {
        super(String.format(
                "An active quarantine already exists for item '%s' and lot '%s'",
                itemId, lotId
        ));
    }

    public DuplicateQuarantineException(String message) {
        super(message);
    }
}