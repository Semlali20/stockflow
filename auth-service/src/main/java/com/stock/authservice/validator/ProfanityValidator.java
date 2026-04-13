package com.stock.authservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.List;

public class ProfanityValidator implements ConstraintValidator<NotProfane, String> {

    // Basic profanity list (add more as needed)
    private static final List<String> PROFANITY_LIST = Arrays.asList(
            // Add profane words here (keeping it minimal for example)
            "badword1", "badword2", "badword3"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }

        String lowerValue = value.toLowerCase();

        for (String profanity : PROFANITY_LIST) {
            if (lowerValue.contains(profanity)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Content contains inappropriate language")
                        .addConstraintViolation();
                return false;
            }
        }

        return true;
    }
}
