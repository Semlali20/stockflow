package com.stock.qualityservice.exception;

public class InspectionNotFoundException extends ResourceNotFoundException {

    public InspectionNotFoundException(String inspectionId) {
        super("Inspection", "id", inspectionId);
    }

    public InspectionNotFoundException(String fieldName, Object fieldValue) {
        super("Inspection", fieldName, fieldValue);
    }
}