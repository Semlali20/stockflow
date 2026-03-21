package com.stock.authservice.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.regex.Pattern;

@Slf4j
public final class IpAddressUtil {

    private IpAddressUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    private static final String[] IP_HEADER_CANDIDATES = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
    };

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    );

    private static final Pattern IPV6_PATTERN = Pattern.compile(
            "^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$"
    );

    // ==================== IP EXTRACTION ====================

    public static String getClientIpAddress(HttpServletRequest request) {
        for (String header : IP_HEADER_CANDIDATES) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
    public static String getClientIpAddressOrDefault(HttpServletRequest request, String defaultValue) {
        String ip = getClientIpAddress(request);
        return "unknown".equals(ip) ? defaultValue : ip;
    }

    // ==================== IP VALIDATION ====================

    public static boolean isValidIp(String ip) {
        return ip != null &&
                !ip.isEmpty() &&
                !"unknown".equalsIgnoreCase(ip) &&
                (isValidIPv4(ip) || isValidIPv6(ip));
    }

    public static boolean isValidIPv4(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        return IPV4_PATTERN.matcher(ip).matches();
    }

    public static boolean isValidIPv6(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        return IPV6_PATTERN.matcher(ip).matches();
    }

    // ==================== IP CATEGORIZATION ====================

    public static boolean isPrivateIP(String ip) {
        if (!isValidIPv4(ip)) {
            return false;
        }

        String[] parts = ip.split("\\.");
        int first = Integer.parseInt(parts[0]);
        int second = Integer.parseInt(parts[1]);

        // 10.0.0.0 - 10.255.255.255
        if (first == 10) {
            return true;
        }

        // 172.16.0.0 - 172.31.255.255
        if (first == 172 && second >= 16 && second <= 31) {
            return true;
        }

        // 192.168.0.0 - 192.168.255.255
        if (first == 192 && second == 168) {
            return true;
        }

        return false;
    }

    public static boolean isLoopbackIP(String ip) {
        if (ip == null) {
            return false;
        }

        // IPv4 loopback: 127.0.0.0/8
        if (ip.startsWith("127.")) {
            return true;
        }

        // IPv6 loopback: ::1
        return "::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip);
    }

    public static boolean isLocalhost(String ip) {
        return "localhost".equalsIgnoreCase(ip) ||
                "127.0.0.1".equals(ip) ||
                "::1".equals(ip) ||
                "0:0:0:0:0:0:0:1".equals(ip);
    }

    // ==================== IP CONVERSION ====================

    public static long ipv4ToLong(String ip) {
        if (!isValidIPv4(ip)) {
            throw new IllegalArgumentException("Invalid IPv4 address: " + ip);
        }

        String[] parts = ip.split("\\.");
        long result = 0;
        for (int i = 0; i < 4; i++) {
            result = result * 256 + Integer.parseInt(parts[i]);
        }
        return result;
    }

    public static String longToIPv4(long ip) {
        return ((ip >> 24) & 0xFF) + "." +
                ((ip >> 16) & 0xFF) + "." +
                ((ip >> 8) & 0xFF) + "." +
                (ip & 0xFF);
    }

    // ==================== IP RANGE ====================

    public static boolean isInRange(String ip, String cidr) {
        try {
            String[] parts = cidr.split("/");
            String rangeIp = parts[0];
            int prefixLength = Integer.parseInt(parts[1]);

            long ipLong = ipv4ToLong(ip);
            long rangeLong = ipv4ToLong(rangeIp);

            long mask = (0xFFFFFFFFL << (32 - prefixLength)) & 0xFFFFFFFFL;

            return (ipLong & mask) == (rangeLong & mask);
        } catch (Exception e) {
            log.error("Error checking IP range: {}", e.getMessage());
            return false;
        }
    }

    // ==================== HOSTNAME RESOLUTION ====================

    public static String getHostName(String ip) {
        try {
            InetAddress addr = InetAddress.getByName(ip);
            return addr.getHostName();
        } catch (UnknownHostException e) {
            log.warn("Cannot resolve hostname for IP: {}", ip);
            return ip;
        }
    }

    public static String getCanonicalHostName(String ip) {
        try {
            InetAddress addr = InetAddress.getByName(ip);
            return addr.getCanonicalHostName();
        } catch (UnknownHostException e) {
            log.warn("Cannot resolve canonical hostname for IP: {}", ip);
            return ip;
        }
    }

    // ==================== IP MASKING ====================

    public static String maskIp(String ip) {
        if (!isValidIPv4(ip)) {
            return "***.***.***";
        }

        String[] parts = ip.split("\\.");
        return parts[0] + "." + parts[1] + ".***.***";
    }

    public static String maskIpFull(String ip) {
        if (!isValidIp(ip)) {
            return "***.***.***";
        }
        return "***.***.***";
    }

    // ==================== GEOLOCATION HELPERS ====================

    public static String getIpForLogging(HttpServletRequest request) {
        String ip = getClientIpAddress(request);
        return isPrivateIP(ip) || isLoopbackIP(ip) ? ip : maskIp(ip);
    }
}
