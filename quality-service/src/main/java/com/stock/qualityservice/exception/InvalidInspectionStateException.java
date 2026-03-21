package com.stock.qualityservice.exception;

import com.stock.qualityservice.entity.QCStatus;

public class InvalidInspectionStateException extends QualityServiceException {

    public InvalidInspectionStateException(String inspectionId, QCStatus currentStatus, String attemptedAction) {
        super(String.format(
                "Cannot perform action '%s' on inspection '%s' with current status '%s'",
                attemptedAction, inspectionId, currentStatus
        ));
    }

    public InvalidInspectionStateException(String message) {
        super(message);
    }
}