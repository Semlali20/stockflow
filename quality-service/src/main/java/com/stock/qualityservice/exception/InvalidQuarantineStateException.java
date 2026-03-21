package com.stock.qualityservice.exception;

import com.stock.qualityservice.entity.QuarantineStatus;

public class InvalidQuarantineStateException extends QualityServiceException {

    public InvalidQuarantineStateException(String quarantineId, QuarantineStatus currentStatus, String attemptedAction) {
        super(String.format(
                "Cannot perform action '%s' on quarantine '%s' with current status '%s'",
                attemptedAction, quarantineId, currentStatus
        ));
    }

    public InvalidQuarantineStateException(String message) {
        super(message);
    }
}