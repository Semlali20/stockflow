package com.stock.authservice.validator;

import com.stock.authservice.util.ValidationUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class UsernameValidator implements ConstraintValidator<ValidUsername, String> {

    private int minLength;
    private int maxLength;
    private boolean allowSpecialChars;

    private static final Pattern ALPHANUMERIC_PATTERN = Pattern.compile("^[a-zA-Z0-9]+$");
    private static final Pattern ALPHANUMERIC_WITH_SPECIAL_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+$");

    // Reserved/forbidden usernames
    private static final List<String> RESERVED_USERNAMES = Arrays.asList(
            "admin", "administrator", "root", "system", "moderator",
            "support", "help", "api", "webmaster", "postmaster",
            "noreply", "no-reply", "null", "undefined"
    );

    @Override
    public void initialize(ValidUsername constraintAnnotation) {
        this.minLength = constraintAnnotation.minLength();
        this.maxLength = constraintAnnotation.maxLength();
        this.allowSpecialChars = constraintAnnotation.allowSpecialChars();
    }

    @Override
    public boolean isValid(String username, ConstraintValidatorContext context) {
        if (username == null || username.isEmpty()) {
            return true; // Use @NotNull or @NotEmpty for null check
        }

        // Length validation
        if (username.length() < minLength || username.length() > maxLength) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    String.format("Username must be between %d and %d characters", minLength, maxLength)
            ).addConstraintViolation();
            return false;
        }

        // Pattern validation
        Pattern pattern = allowSpecialChars ? ALPHANUMERIC_WITH_SPECIAL_PATTERN : ALPHANUMERIC_PATTERN;
        if (!pattern.matcher(username).matches()) {
            context.disableDefaultConstraintViolation();
            String allowedChars = allowSpecialChars ?
                    "letters, numbers, underscores, and hyphens" :
                    "letters and numbers";
            context.buildConstraintViolationWithTemplate(
                    "Username can only contain " + allowedChars
            ).addConstraintViolation();
            return false;
        }

        // Reserved username check
        if (RESERVED_USERNAMES.contains(username.toLowerCase())) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("This username is reserved and cannot be used")
                    .addConstraintViolation();
            return false;
        }

        // Cannot start or end with special characters
        if (allowSpecialChars && (username.startsWith("_") || username.startsWith("-") ||
                username.endsWith("_") || username.endsWith("-"))) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Username cannot start or end with special characters")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
