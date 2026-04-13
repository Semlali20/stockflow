package com.stock.inventoryservice.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Location response from location-service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationResponseDTO {

    private String id;
    private String warehouseId;
    private String warehouseName;
    private String code;
    private String zone;
    private String aisle;
    private String rack;
    private String level;
    private String bin;
    private String type; // LocationType as String
    private String capacity; // Capacity as String (e.g., "1000", "500.5")
    private String restrictions;
    private String coordinates;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Parse capacity as Double
     * @return capacity as Double, or null if invalid
     */
    public Double getCapacityAsDouble() {
        if (capacity == null || capacity.trim().isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(capacity.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
