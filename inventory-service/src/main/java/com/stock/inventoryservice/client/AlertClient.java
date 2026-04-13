package com.stock.inventoryservice.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * 🚨 Alert Service Client
 * REST client for creating alerts in the Alert Service with JWT Authentication
 */
@Component
@Slf4j
public class AlertClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${services.alert-service.url:http://localhost:8088}")
    private String alertServiceUrl;

    public AlertClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Create a location capacity alert
     */
    public void createLocationCapacityAlert(
            String severity,
            String locationId,
            String locationCode,
            String message,
            Double currentQuantity,
            Double capacity,
            Double percentageFull
    ) {
        try {
            log.info("🚨 Creating location capacity alert - Location: {}, Severity: {}, Percentage: {}%",
                    locationCode, severity, percentageFull);

            Map<String, Object> data = Map.of(
                    "locationId", locationId,
                    "locationCode", locationCode,
                    "currentQuantity", currentQuantity,
                    "capacity", capacity,
                    "percentageFull", percentageFull,
                    "alertReason", "LOCATION_CAPACITY"
            );

            String dataJson = objectMapper.writeValueAsString(data);

            String url = UriComponentsBuilder
                    .fromHttpUrl(alertServiceUrl + "/api/alerts")
                    .queryParam("type", mapSeverityToAlertType(severity))
                    .queryParam("level", mapSeverityToAlertLevel(severity))
                    .queryParam("entityType", "LOCATION")
                    .queryParam("entityId", locationId)
                    .queryParam("message", message)
                    .queryParam("data", dataJson)
                    .toUriString();

            HttpHeaders headers = createHeadersWithToken();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);

            log.info("✅ Location capacity alert created successfully");

        } catch (Exception e) {
            log.error("❌ Failed to create location capacity alert: {}", e.getMessage(), e);
        }
    }

    /**
     * Create a low stock alert
     */
    public void createLowStockAlert(
            String itemId,
            String locationId,
            Double currentQuantity,
            Double threshold
    ) {
        try {
            log.info("⚠️ Creating low stock alert - Item: {}, Location: {}, Quantity: {}",
                    itemId, locationId, currentQuantity);

            Map<String, Object> data = Map.of(
                    "itemId", itemId,
                    "locationId", locationId,
                    "currentQuantity", currentQuantity,
                    "threshold", threshold,
                    "alertReason", "LOW_STOCK"
            );

            String dataJson = objectMapper.writeValueAsString(data);
            String message = String.format("Low stock detected for item %s at location %s. Current: %.2f, Threshold: %.2f",
                    itemId, locationId, currentQuantity, threshold);

            String url = UriComponentsBuilder
                    .fromHttpUrl(alertServiceUrl + "/api/alerts")
                    .queryParam("type", "LOW_STOCK")
                    .queryParam("level", determineStockAlertLevel(currentQuantity))
                    .queryParam("entityType", "ITEM")
                    .queryParam("entityId", itemId)
                    .queryParam("message", message)
                    .queryParam("data", dataJson)
                    .toUriString();

            HttpHeaders headers = createHeadersWithToken();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);

            log.info("✅ Low stock alert created successfully");

        } catch (Exception e) {
            log.error("❌ Failed to create low stock alert: {}", e.getMessage(), e);
        }
    }

    /**
     * Create an expiry alert
     */
    public void createExpiryAlert(
            String itemId,
            String lotId,
            String expiryDate,
            Integer daysUntilExpiry
    ) {
        try {
            log.info("⚠️ Creating expiry alert - Item: {}, Lot: {}, Days until expiry: {}",
                    itemId, lotId, daysUntilExpiry);

            Map<String, Object> data = Map.of(
                    "itemId", itemId,
                    "lotId", lotId,
                    "expiryDate", expiryDate,
                    "daysUntilExpiry", daysUntilExpiry,
                    "alertReason", "EXPIRY_WARNING"
            );

            String dataJson = objectMapper.writeValueAsString(data);
            String message = String.format("Item %s (Lot: %s) will expire in %d days on %s",
                    itemId, lotId, daysUntilExpiry, expiryDate);

            String url = UriComponentsBuilder
                    .fromHttpUrl(alertServiceUrl + "/api/alerts")
                    .queryParam("type", "EXPIRY")
                    .queryParam("level", determineExpiryAlertLevel(daysUntilExpiry))
                    .queryParam("entityType", "LOT")
                    .queryParam("entityId", lotId)
                    .queryParam("message", message)
                    .queryParam("data", dataJson)
                    .toUriString();

            HttpHeaders headers = createHeadersWithToken();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);

            log.info("✅ Expiry alert created successfully");

        } catch (Exception e) {
            log.error("❌ Failed to create expiry alert: {}", e.getMessage(), e);
        }
    }

    private HttpHeaders createHeadersWithToken() {
        HttpHeaders headers = new HttpHeaders();

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                headers.setBearerAuth(jwt.getTokenValue());
                log.debug("✅ Added Bearer token to request headers");
            } else {
                log.warn("⚠️ No JWT token found in SecurityContext");
            }
        } catch (Exception e) {
            log.error("❌ Failed to extract JWT token: {}", e.getMessage());
        }

        return headers;
    }

    private String mapSeverityToAlertType(String severity) {
        return severity.equalsIgnoreCase("CRITICAL") || severity.equalsIgnoreCase("WARNING") 
                ? "LOCATION" : "SYSTEM";
    }

    private String mapSeverityToAlertLevel(String severity) {
        switch (severity.toUpperCase()) {
            case "CRITICAL": return "EMERGENCY";
            case "WARNING": return "WARNING";
            default: return "INFO";
        }
    }

    private String determineStockAlertLevel(Double quantity) {
        if (quantity < 5.0) return "EMERGENCY";
        else if (quantity < 10.0) return "WARNING";
        else return "INFO";
    }

    private String determineExpiryAlertLevel(Integer daysUntilExpiry) {
        if (daysUntilExpiry <= 7) return "EMERGENCY";
        else if (daysUntilExpiry <= 30) return "WARNING";
        else return "INFO";
    }
}