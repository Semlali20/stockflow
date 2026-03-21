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
public class ItemEvent {
    private String id;
    private String sku;
    private String name;
    private String description;
    private String categoryId;
    private Boolean isActive;
    private Boolean isSerialized;
    private Boolean isLotManaged;
    private Integer shelfLifeDays;
    private String eventType; // CREATED, UPDATED, DELETED
    private LocalDateTime timestamp;
}