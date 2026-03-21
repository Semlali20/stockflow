package com.stock.qualityservice.exception;

public class DuplicateInspectionException extends QualityServiceException {

    public DuplicateInspectionException(String inspectionNumber) {
        super(String.format("Inspection with number '%s' already exists", inspectionNumber));
    }

    public DuplicateInspectionException(String itemId, String lotId) {
        super(String.format(
                "An active inspection already exists for item '%s' and lot '%s'",
                itemId, lotId
        ));
    }
}