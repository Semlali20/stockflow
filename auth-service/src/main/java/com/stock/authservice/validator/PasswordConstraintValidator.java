package com.stock.authservice.validator;

import com.stock.authservice.util.PasswordValidator;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class PasswordConstraintValidator implements ConstraintValidator<ValidPassword, String> {

    private boolean checkCommonPasswords;
    private boolean checkSequential;
    private boolean checkRepeating;

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
        this.checkCommonPasswords = constraintAnnotation.checkCommonPasswords();
        this.checkSequential = constraintAnnotation.checkSequential();
        this.checkRepeating = constraintAnnotation.checkRepeating();
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isEmpty()) {
            return false;
        }

        // Get validation errors from PasswordValidator
        List<String> errors = PasswordValidator.validate(password);

        // Check for common passwords
        if (checkCommonPasswords && PasswordValidator.isCommonPassword(password)) {
            errors.add("Password is too common and easily guessable");
        }

        // Check for sequential characters
        if (checkSequential && PasswordValidator.hasSequentialChars(password)) {
            errors.add("Password contains sequential characters (e.g., 123, abc)");
        }

        // Check for repeating characters
        if (checkRepeating && PasswordValidator.hasRepeatingChars(password)) {
            errors.add("Password contains repeating characters (e.g., aaa, 111)");
        }

        if (!errors.isEmpty()) {
            // Disable default message
            context.disableDefaultConstraintViolation();

            // Add custom messages
            for (String error : errors) {
                context.buildConstraintViolationWithTemplate(error)
                        .addConstraintViolation();
            }

            return false;
        }

        return true;
    }
}
