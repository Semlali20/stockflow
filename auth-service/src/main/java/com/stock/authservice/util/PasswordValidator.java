package com.stock.authservice.util;

import com.stock.authservice.constants.SecurityConstants;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public final class PasswordValidator {

    private PasswordValidator() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[" + Pattern.quote(SecurityConstants.PASSWORD_SPECIAL_CHARS) + "]");

    // ==================== VALIDATION ====================

    public static boolean isValid(String password) {
        return validate(password).isEmpty();
    }

    public static List<String> validate(String password) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.isEmpty()) {
            errors.add("Password is required");
            return errors;
        }

        // Length validation
        if (password.length() < SecurityConstants.PASSWORD_MIN_LENGTH) {
            errors.add(String.format("Password must be at least %d characters long",
                    SecurityConstants.PASSWORD_MIN_LENGTH));
        }

        if (password.length() > SecurityConstants.PASSWORD_MAX_LENGTH) {
            errors.add(String.format("Password must not exceed %d characters",
                    SecurityConstants.PASSWORD_MAX_LENGTH));
        }

        // Uppercase validation
        if (countMatches(password, UPPERCASE_PATTERN) < SecurityConstants.PASSWORD_MIN_UPPERCASE) {
            errors.add(String.format("Password must contain at least %d uppercase letter(s)",
                    SecurityConstants.PASSWORD_MIN_UPPERCASE));
        }

        // Lowercase validation
        if (countMatches(password, LOWERCASE_PATTERN) < SecurityConstants.PASSWORD_MIN_LOWERCASE) {
            errors.add(String.format("Password must contain at least %d lowercase letter(s)",
                    SecurityConstants.PASSWORD_MIN_LOWERCASE));
        }

        // Digit validation
        if (countMatches(password, DIGIT_PATTERN) < SecurityConstants.PASSWORD_MIN_DIGITS) {
            errors.add(String.format("Password must contain at least %d digit(s)",
                    SecurityConstants.PASSWORD_MIN_DIGITS));
        }

        // Special character validation
        if (countMatches(password, SPECIAL_CHAR_PATTERN) < SecurityConstants.PASSWORD_MIN_SPECIAL_CHARS) {
            errors.add(String.format("Password must contain at least %d special character(s) from: %s",
                    SecurityConstants.PASSWORD_MIN_SPECIAL_CHARS,
                    SecurityConstants.PASSWORD_SPECIAL_CHARS));
        }

        return errors;
    }

    // ==================== PASSWORD STRENGTH ====================

    public static int calculateStrength(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }

        int score = 0;

        // Length score
        if (password.length() >= 8) score++;
        if (password.length() >= 12) score++;
        if (password.length() >= 16) score++;

        // Character diversity score
        if (UPPERCASE_PATTERN.matcher(password).find()) score++;
        if (LOWERCASE_PATTERN.matcher(password).find()) score++;
        if (DIGIT_PATTERN.matcher(password).find()) score++;
        if (SPECIAL_CHAR_PATTERN.matcher(password).find()) score++;

        // Bonus for multiple character types
        int uppercaseCount = countMatches(password, UPPERCASE_PATTERN);
        int lowercaseCount = countMatches(password, LOWERCASE_PATTERN);
        int digitCount = countMatches(password, DIGIT_PATTERN);
        int specialCount = countMatches(password, SPECIAL_CHAR_PATTERN);

        if (uppercaseCount >= 2) score++;
        if (lowercaseCount >= 2) score++;
        if (digitCount >= 2) score++;
        if (specialCount >= 2) score++;

        // Normalize to 0-4 scale
        return Math.min(score / 3, 4);
    }

    public static String getStrengthLabel(int strength) {
        return switch (strength) {
            case 0, 1 -> "WEAK";
            case 2 -> "FAIR";
            case 3 -> "GOOD";
            case 4 -> "STRONG";
            default -> "VERY_WEAK";
        };
    }

    // ==================== COMMON PATTERNS ====================

    public static boolean isCommonPassword(String password) {
        if (password == null) {
            return false;
        }

        String lowerPassword = password.toLowerCase();

        // Common passwords list (add more as needed)
        String[] commonPasswords = {
                "password", "123456", "12345678", "qwerty", "abc123",
                "monkey", "1234567", "letmein", "trustno1", "dragon",
                "baseball", "iloveyou", "master", "sunshine", "ashley",
                "bailey", "passw0rd", "shadow", "123123", "654321",
                "superman", "admin", "root", "user", "welcome"
        };

        for (String common : commonPasswords) {
            if (lowerPassword.contains(common)) {
                return true;
            }
        }

        return false;
    }

    public static boolean hasSequentialChars(String password) {
        if (password == null || password.length() < 3) {
            return false;
        }

        for (int i = 0; i < password.length() - 2; i++) {
            char c1 = password.charAt(i);
            char c2 = password.charAt(i + 1);
            char c3 = password.charAt(i + 2);

            // Check for sequential numbers (123, 234, etc.)
            if (Character.isDigit(c1) && Character.isDigit(c2) && Character.isDigit(c3)) {
                if (c2 == c1 + 1 && c3 == c2 + 1) {
                    return true;
                }
            }

            // Check for sequential letters (abc, bcd, etc.)
            if (Character.isLetter(c1) && Character.isLetter(c2) && Character.isLetter(c3)) {
                if (Character.toLowerCase(c2) == Character.toLowerCase(c1) + 1 &&
                        Character.toLowerCase(c3) == Character.toLowerCase(c2) + 1) {
                    return true;
                }
            }
        }

        return false;
    }

    public static boolean hasRepeatingChars(String password) {
        if (password == null || password.length() < 3) {
            return false;
        }

        for (int i = 0; i < password.length() - 2; i++) {
            if (password.charAt(i) == password.charAt(i + 1) &&
                    password.charAt(i) == password.charAt(i + 2)) {
                return true;
            }
        }

        return false;
    }

    // ==================== HELPER METHODS ====================

    private static int countMatches(String text, Pattern pattern) {
        int count = 0;
        var matcher = pattern.matcher(text);
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    public static String generatePasswordRequirementsMessage() {
        return String.format(
                "Password must:\n" +
                        "- Be between %d and %d characters\n" +
                        "- Contain at least %d uppercase letter(s)\n" +
                        "- Contain at least %d lowercase letter(s)\n" +
                        "- Contain at least %d digit(s)\n" +
                        "- Contain at least %d special character(s) from: %s",
                SecurityConstants.PASSWORD_MIN_LENGTH,
                SecurityConstants.PASSWORD_MAX_LENGTH,
                SecurityConstants.PASSWORD_MIN_UPPERCASE,
                SecurityConstants.PASSWORD_MIN_LOWERCASE,
                SecurityConstants.PASSWORD_MIN_DIGITS,
                SecurityConstants.PASSWORD_MIN_SPECIAL_CHARS,
                SecurityConstants.PASSWORD_SPECIAL_CHARS
        );
    }
}
