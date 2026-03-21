package com.stock.qualityservice.exception;

public class BusinessRuleViolationException extends QualityServiceException {

    public BusinessRuleViolationException(String ruleName, String violation) {
        super(String.format(
                "Business rule '%s' violated: %s",
                ruleName, violation
        ));
    }

    public BusinessRuleViolationException(String message) {
        super(message);
    }
}