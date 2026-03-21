package com.stock.alertservice.event.incoming;

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
    private String categoryId;
    private String itemVariantId;
    private Boolean isActive;
    private Boolean isSerialized;
    private Boolean isLotManaged;
    private Integer shelfLifeDays;
    private LocalDateTime timestamp;
    private String eventType;
}
