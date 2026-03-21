package com.stock.qualityservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

/**
 * 📦 Product Service Client
 * REST client for fetching product/item information
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.product.url:http://localhost:8082}")
    private String productServiceUrl;

    /**
     * Get item details by ID
     */
    public ItemDTO getItemById(UUID itemId) {
        try {
            log.info("🔍 Fetching item details for: {}", itemId);
            String url = productServiceUrl + "/api/items/" + itemId;
            ItemDTO item = restTemplate.getForObject(url, ItemDTO.class);
            log.info("✅ Item fetched successfully: {}", item != null ? item.getName() : "null");
            return item;
        } catch (Exception e) {
            log.error("❌ Failed to fetch item {}: {}", itemId, e.getMessage());
            return null;
        }
    }

    /**
     * Get quality profile for item
     */
    public QualityProfileDTO getQualityProfile(UUID itemId) {
        try {
            log.info("🔍 Fetching quality profile for item: {}", itemId);
            String url = productServiceUrl + "/api/items/" + itemId + "/quality-profile";
            QualityProfileDTO profile = restTemplate.getForObject(url, QualityProfileDTO.class);
            log.info("✅ Quality profile fetched successfully");
            return profile;
        } catch (Exception e) {
            log.error("❌ Failed to fetch quality profile for item {}: {}", itemId, e.getMessage());
            return null;
        }
    }

    /**
     * Check if item requires inspection
     */
    public Boolean requiresInspection(UUID itemId) {
        try {
            log.info("🔍 Checking if item requires inspection: {}", itemId);
            String url = productServiceUrl + "/api/items/" + itemId + "/requires-inspection";
            Boolean requires = restTemplate.getForObject(url, Boolean.class);
            log.info("✅ Inspection requirement: {}", requires);
            return requires != null ? requires : false;
        } catch (Exception e) {
            log.error("❌ Failed to check inspection requirement for item {}: {}", itemId, e.getMessage());
            return false; // Default to not required if service unavailable
        }
    }

    /**
     * Item DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ItemDTO {
        private UUID id;
        private String sku;
        private String name;
        private String description;
        private String category;
        private UUID qualityProfileId;
        private Boolean requiresInspection;
    }

    /**
     * Quality Profile DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class QualityProfileDTO {
        private UUID id;
        private String name;
        private String description;
        private Boolean requiresInspection;
        private Integer inspectionFrequency; // Every N receipts
        private String inspectionLevel; // NORMAL, REDUCED, TIGHTENED
    }
}
