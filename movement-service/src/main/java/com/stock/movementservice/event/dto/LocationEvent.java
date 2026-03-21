package com.stock.movementservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationEvent {
    private String locationId;
    private String code;
    private String name;
    private String warehouseId;
    private String zone;
    private String aisle;
    private String rack;
    private String level;
    private String bin;
    private Boolean isActive;
    private String eventType; // CREATED, UPDATED, DELETED
    private LocalDateTime timestamp;
}