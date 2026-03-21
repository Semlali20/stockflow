package com.stock.locationservice.dto;

import com.stock.locationservice.entity.LocationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationCreateRequest {

    @NotBlank(message = "Warehouse ID is required")
    private String warehouseId;

    @NotBlank(message = "Location code is required")
    private String code;

    private String zone;
    private String aisle;
    private String rack;
    private String level;
    private String bin;

    @NotNull(message = "Location type is required")
    private LocationType type;

    private String capacity;
    private String restrictions;
    private String coordinates;
}
