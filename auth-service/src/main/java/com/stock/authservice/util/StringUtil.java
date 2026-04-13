package com.stock.authservice.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class StringUtil {

    private StringUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // ==================== NULL SAFETY ====================

    public static String defaultIfNull(String str, String defaultValue) {
        return str != null ? str : defaultValue;
    }

    public static String defaultIfEmpty(String str, String defaultValue) {
        return (str != null && !str.isEmpty()) ? str : defaultValue;
    }

    public static String defaultIfBlank(String str, String defaultValue) {
        return (str != null && !str.isBlank()) ? str : defaultValue;
    }

    // ==================== TRUNCATION ====================

    public static String truncate(String str, int maxLength) {
        if (str == null || str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength);
    }

    public static String truncateWithEllipsis(String str, int maxLength) {
        if (str == null || str.length() <= maxLength) {
            return str;
        }
        if (maxLength < 3) {
            return str.substring(0, maxLength);
        }
        return str.substring(0, maxLength - 3) + "...";
    }

    // ==================== CASE CONVERSION ====================

    public static String toSnakeCase(String str) {
        if (str == null) {
            return null;
        }
        return str.replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
    }

    public static String toCamelCase(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        String[] parts = str.split("_");
        StringBuilder camelCase = new StringBuilder(parts[0].toLowerCase());
        for (int i = 1; i < parts.length; i++) {
            camelCase.append(capitalize(parts[i]));
        }
        return camelCase.toString();
    }

    public static String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public static String capitalizeWords(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        String[] words = str.split("\\s+");
        return Arrays.stream(words)
                .map(StringUtil::capitalize)
                .collect(Collectors.joining(" "));
    }

    // ==================== MASKING ====================

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];

        if (username.length() <= 2) {
            return "***@" + domain;
        }

        return username.substring(0, 2) + "***@" + domain;
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return "****";
        }
        int visibleDigits = 4;
        String masked = "*".repeat(phone.length() - visibleDigits);
        return masked + phone.substring(phone.length() - visibleDigits);
    }

    public static String maskCreditCard(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }

    // ==================== STRING MANIPULATION ====================

    public static String reverse(String str) {
        if (str == null) {
            return null;
        }
        return new StringBuilder(str).reverse().toString();
    }

    public static String repeat(String str, int count) {
        if (str == null || count <= 0) {
            return "";
        }
        return str.repeat(count);
    }

    public static String removeWhitespace(String str) {
        if (str == null) {
            return null;
        }
        return str.replaceAll("\\s+", "");
    }

    public static String removeNonAlphanumeric(String str) {
        if (str == null) {
            return null;
        }
        return str.replaceAll("[^a-zA-Z0-9]", "");
    }

    // ==================== JOINING ====================

    public static String join(List<String> list, String delimiter) {
        if (list == null || list.isEmpty()) {
            return "";
        }
        return String.join(delimiter, list);
    }

    public static String joinWithComma(List<String> list) {
        return join(list, ", ");
    }

    // ==================== COMPARISON ====================

    public static boolean containsIgnoreCase(String str, String searchStr) {
        if (str == null || searchStr == null) {
            return false;
        }
        return str.toLowerCase().contains(searchStr.toLowerCase());
    }

    public static boolean startsWithIgnoreCase(String str, String prefix) {
        if (str == null || prefix == null) {
            return false;
        }
        return str.toLowerCase().startsWith(prefix.toLowerCase());
    }

    public static boolean endsWithIgnoreCase(String str, String suffix) {
        if (str == null || suffix == null) {
            return false;
        }
        return str.toLowerCase().endsWith(suffix.toLowerCase());
    }

    // ==================== COUNTING ====================

    public static int countOccurrences(String str, String substring) {
        if (str == null || substring == null || substring.isEmpty()) {
            return 0;
        }
        int count = 0;
        int index = 0;
        while ((index = str.indexOf(substring, index)) != -1) {
            count++;
            index += substring.length();
        }
        return count;
    }

    public static int countWords(String str) {
        if (str == null || str.isBlank()) {
            return 0;
        }
        return str.trim().split("\\s+").length;
    }
}
