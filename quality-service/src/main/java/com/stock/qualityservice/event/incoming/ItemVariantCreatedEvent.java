package com.stock.qualityservice.event.incoming;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemVariantCreatedEvent {

    private String eventId;
    private String eventType; // ITEM_VARIANT_CREATED
    private LocalDateTime eventTime;

    private String variantId;
    private String parentItemId;
    private String sku;
    private String variantAttributes; // JSON
    private Boolean isActive;
}