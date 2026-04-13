package com.stock.authservice.validator;

import com.stock.authservice.util.ValidationUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.List;

public class EmailValidator implements ConstraintValidator<ValidEmail, String> {

    private boolean allowDisposable;

    // Common disposable email domains
    private static final List<String> DISPOSABLE_DOMAINS = Arrays.asList(
            "tempmail.com", "throwaway.email", "guerrillamail.com",
            "mailinator.com", "10minutemail.com", "trashmail.com",
            "yopmail.com", "fakeinbox.com", "sharklasers.com"
    );

    @Override
    public void initialize(ValidEmail constraintAnnotation) {
        this.allowDisposable = constraintAnnotation.allowDisposable();
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isEmpty()) {
            return true; // Use @NotNull or @NotEmpty for null check
        }

        // Basic email validation
        if (!ValidationUtil.isValidEmail(email)) {
            return false;
        }

        // Check for disposable email
        if (!allowDisposable && isDisposableEmail(email)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Disposable email addresses are not allowed")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }

    private boolean isDisposableEmail(String email) {
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        return DISPOSABLE_DOMAINS.contains(domain);
    }
}
