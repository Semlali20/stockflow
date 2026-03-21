package com.stock.authservice.validator;

import com.stock.authservice.util.ValidationUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private boolean requireCountryCode;

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        this.requireCountryCode = constraintAnnotation.requireCountryCode();
    }

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return true; // Use @NotNull or @NotEmpty for null check
        }

        // Remove all non-digit characters except '+'
        String cleanedNumber = phoneNumber.replaceAll("[^0-9+]", "");

        // Check if it starts with '+'
        if (requireCountryCode && !cleanedNumber.startsWith("+")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number must include country code (e.g., +1)")
                    .addConstraintViolation();
            return false;
        }

        // Use E.164 format validation
        if (!ValidationUtil.isValidPhone(cleanedNumber)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number must be in valid international format (E.164)")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
