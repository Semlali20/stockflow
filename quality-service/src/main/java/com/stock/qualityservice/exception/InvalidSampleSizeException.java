package com.stock.qualityservice.exception;

public class InvalidSampleSizeException extends QualityServiceException {

    public InvalidSampleSizeException(Integer sampleSize, Integer lotSize) {
        super(String.format(
                "Invalid sample size %d for lot size %d. Sample size cannot exceed lot size",
                sampleSize, lotSize
        ));
    }

    public InvalidSampleSizeException(String message) {
        super(message);
    }
}