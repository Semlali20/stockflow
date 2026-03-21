package com.stock.qualityservice.event.incoming;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemUpdatedEvent {

    private String eventId;
    private String eventType; // ITEM_UPDATED
    private LocalDateTime eventTime;

    private String itemId;
    private String sku;
    private String name;
    private String description;
    private String categoryId;
    private Boolean requiresInspection;
    private Boolean isActive;
}