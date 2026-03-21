package com.stock.qualityservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

/**
 * 📍 Location Service Client
 * REST client for location operations (warehouses, zones, bins)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.location.url:http://localhost:8085}")
    private String locationServiceUrl;

    /**
     * Get location details by ID
     */
    public LocationDTO getLocationById(UUID locationId) {
        try {
            log.info("🔍 Fetching location details for: {}", locationId);
            String url = locationServiceUrl + "/api/locations/" + locationId;
            LocationDTO location = restTemplate.getForObject(url, LocationDTO.class);
            log.info("✅ Location fetched successfully: {}", location != null ? location.getName() : "null");
            return location;
        } catch (Exception e) {
            log.error("❌ Failed to fetch location {}: {}", locationId, e.getMessage());
            return null;
        }
    }

    /**
     * Get quarantine location for warehouse
     */
    public LocationDTO getQuarantineLocation(UUID warehouseId) {
        try {
            log.info("🔍 Fetching quarantine location for warehouse: {}", warehouseId);
            String url = locationServiceUrl + "/api/locations/quarantine?warehouseId=" + warehouseId;
            LocationDTO location = restTemplate.getForObject(url, LocationDTO.class);

            if (location != null) {
                log.info("✅ Quarantine location found: {}", location.getName());
            } else {
                log.warn("⚠️ No quarantine location found for warehouse: {}", warehouseId);
            }

            return location;
        } catch (Exception e) {
            log.error("❌ Failed to fetch quarantine location: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get inspection location for warehouse
     */
    public LocationDTO getInspectionLocation(UUID warehouseId) {
        try {
            log.info("🔍 Fetching inspection location for warehouse: {}", warehouseId);
            String url = locationServiceUrl + "/api/locations/inspection?warehouseId=" + warehouseId;
            LocationDTO location = restTemplate.getForObject(url, LocationDTO.class);

            if (location != null) {
                log.info("✅ Inspection location found: {}", location.getName());
            } else {
                log.warn("⚠️ No inspection location found for warehouse: {}", warehouseId);
            }

            return location;
        } catch (Exception e) {
            log.error("❌ Failed to fetch inspection location: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get all locations by type
     */
    public List<LocationDTO> getLocationsByType(UUID warehouseId, String locationType) {
        try {
            log.info("🔍 Fetching {} locations for warehouse: {}", locationType, warehouseId);
            String url = locationServiceUrl + "/api/locations/by-type" +
                    "?warehouseId=" + warehouseId +
                    "&type=" + locationType;

            LocationDTO[] locationsArray = restTemplate.getForObject(url, LocationDTO[].class);
            List<LocationDTO> locations = locationsArray != null ? List.of(locationsArray) : List.of();

            log.info("✅ Found {} {} locations", locations.size(), locationType);
            return locations;
        } catch (Exception e) {
            log.error("❌ Failed to fetch locations by type: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Check if location is quarantine zone
     */
    public Boolean isQuarantineLocation(UUID locationId) {
        try {
            log.info("🔍 Checking if location is quarantine zone: {}", locationId);
            String url = locationServiceUrl + "/api/locations/" + locationId + "/is-quarantine";
            Boolean isQuarantine = restTemplate.getForObject(url, Boolean.class);
            log.info("✅ Quarantine check: {}", isQuarantine);
            return isQuarantine != null ? isQuarantine : false;
        } catch (Exception e) {
            log.error("❌ Failed to check quarantine status: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Location DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class LocationDTO {
        private UUID id;
        private String code;
        private String name;
        private String type; // WAREHOUSE, ZONE, BIN, QUARANTINE, INSPECTION, STAGING
        private UUID warehouseId;
        private UUID parentLocationId;
        private Boolean isActive;
        private Integer capacity;
        private String barcode;
    }
}
