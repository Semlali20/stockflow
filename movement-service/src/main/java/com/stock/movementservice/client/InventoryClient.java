package com.stock.movementservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * 🔥 Client to communicate with Inventory Service
 * Checks stock availability before movement execution
 */
@Component
@Slf4j
public class InventoryClient {

    private final RestTemplate restTemplate;
    private final String inventoryServiceUrl;

    public InventoryClient(RestTemplate restTemplate,
                           @Value("${inventory.service.url:http://localhost:8086}") String inventoryServiceUrl) {
        this.restTemplate = restTemplate;
        this.inventoryServiceUrl = inventoryServiceUrl;
    }

    /**
     * ✅ Check if sufficient stock is available
     */
    public Boolean checkStockAvailability(String itemId, String locationId, Double quantity) {
        log.debug("Checking stock availability - Item: {}, Location: {}, Qty: {}",
                itemId, locationId, quantity);

        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(inventoryServiceUrl + "/api/inventory/check-availability")
                    .queryParam("itemId", itemId)
                    .queryParam("locationId", locationId)
                    .queryParam("quantity", quantity)
                    .toUriString();

            // Create headers with Bearer token
            HttpHeaders headers = createHeadersWithToken();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Boolean> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Boolean.class
            );

            Boolean result = response.getBody();
            log.debug("Stock availability result: {}", result);
            return result != null && result;
        } catch (Exception e) {
            log.error("Error checking stock availability", e);
            throw new RuntimeException("Failed to check stock availability: " + e.getMessage());
        }
    }

    /**
     * ✅ Get available quantity for an item at a location
     */
    public Double getAvailableQuantity(String itemId, String locationId) {
        log.debug("Getting available quantity - Item: {}, Location: {}", itemId, locationId);

        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(inventoryServiceUrl + "/api/inventory/available-quantity")
                    .queryParam("itemId", itemId)
                    .queryParam("locationId", locationId)
                    .toUriString();

            // Create headers with Bearer token
            HttpHeaders headers = createHeadersWithToken();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Double> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Double.class
            );

            Double result = response.getBody();
            log.debug("Available quantity: {}", result);
            return result != null ? result : 0.0;
        } catch (Exception e) {
            log.error("Error getting available quantity", e);
            throw new RuntimeException("Failed to get available quantity: " + e.getMessage());
        }
    }

    /**
     * 🔥 Create HTTP headers with Bearer token from security context
     */
    private HttpHeaders createHeadersWithToken() {
        HttpHeaders headers = new HttpHeaders();

        try {
            // Get authentication from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                String token = jwt.getTokenValue();

                // Add Bearer token to Authorization header
                headers.set("Authorization", "Bearer " + token);
                log.debug("Added Bearer token to request headers");
            } else {
                log.warn("No JWT token found in security context");
            }
        } catch (Exception e) {
            log.error("Error extracting JWT token from security context", e);
        }

        return headers;
    }
}
