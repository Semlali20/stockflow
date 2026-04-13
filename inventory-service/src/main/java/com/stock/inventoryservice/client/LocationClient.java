package com.stock.inventoryservice.client;

import com.stock.inventoryservice.dto.external.LocationResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocationClient {

    private final WebClient webClient;

    @Value("${services.location-service.url}")
    private String locationServiceUrl;

    public LocationResponseDTO getLocationById(String locationId) {
        try {
            log.info("🔍 Fetching location with ID: {}", locationId);
            
            // Get the JWT token from Security Context
            String token = getJwtToken();
            
            return webClient.get()
                    .uri(locationServiceUrl + "/api/locations/{id}", locationId)
                    .header("Authorization", "Bearer " + token)  // 🔥 ADD JWT TOKEN!
                    .retrieve()
                    .bodyToMono(LocationResponseDTO.class)
                    .block();
                    
        } catch (Exception e) {
            log.error("❌ Failed to fetch location with ID: {}", locationId, e);
            throw new RuntimeException("Unable to fetch location details from location-service", e);
        }
    }
    
    /**
     * Extract JWT token from Security Context
     */
    private String getJwtToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getTokenValue();
        }
        
        log.warn("⚠️ No JWT token found in Security Context!");
        return "";
    }
}