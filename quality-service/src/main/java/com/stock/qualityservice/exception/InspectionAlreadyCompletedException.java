package com.stock.qualityservice.exception;

public class InspectionAlreadyCompletedException extends QualityServiceException {

    public InspectionAlreadyCompletedException(String inspectionId) {
        super(String.format("Inspection '%s' has already been completed and cannot be modified", inspectionId));
    }
}