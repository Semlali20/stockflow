package com.stock.locationservice.dto;

import com.stock.locationservice.entity.LocationType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationSearchRequest {

    private String warehouseId;
    private String zone;
    private String aisle;
    private LocationType type;
    private Boolean isActive;
}
