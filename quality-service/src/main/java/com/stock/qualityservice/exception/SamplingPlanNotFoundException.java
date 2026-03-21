package com.stock.qualityservice.exception;

public class SamplingPlanNotFoundException extends ResourceNotFoundException {

    public SamplingPlanNotFoundException(String samplingPlanId) {
        super("Sampling Plan", "id", samplingPlanId);
    }

    public SamplingPlanNotFoundException(String fieldName, Object fieldValue) {
        super("Sampling Plan", fieldName, fieldValue);
    }
}