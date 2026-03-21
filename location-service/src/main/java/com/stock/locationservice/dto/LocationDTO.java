package com.stock.locationservice.dto;

import com.stock.locationservice.entity.LocationType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationDTO {

    private String id;
    private String warehouseId;
    private String warehouseName;  // Pour affichage
    private String code;
    private String zone;
    private String aisle;
    private String rack;
    private String level;
    private String bin;
    private LocationType type;
    private String capacity;
    private String restrictions;
    private String coordinates;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
