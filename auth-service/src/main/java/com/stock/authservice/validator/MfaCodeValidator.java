package com.stock.authservice.validator;

import com.stock.authservice.constants.SecurityConstants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class MfaCodeValidator implements ConstraintValidator<ValidMfaCode, String> {

    private int codeLength;

    @Override
    public void initialize(ValidMfaCode constraintAnnotation) {
        this.codeLength = constraintAnnotation.codeLength();
    }

    @Override
    public boolean isValid(String code, ConstraintValidatorContext context) {
        if (code == null || code.isEmpty()) {
            return false;
        }

        // Check length
        if (code.length() != codeLength) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    String.format("MFA code must be exactly %d digits", codeLength)
            ).addConstraintViolation();
            return false;
        }

        // Check if all characters are digits
        if (!code.matches("\\d+")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("MFA code must contain only digits")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
