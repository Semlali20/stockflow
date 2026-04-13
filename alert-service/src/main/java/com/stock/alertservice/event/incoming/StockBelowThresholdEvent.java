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
public class StockBelowThresholdEvent {

    private String itemId;
    private String locationId;
    private String warehouseId;
    private Double currentQuantity;
    private Double threshold;
    private String alertLevel; // WARNING, CRITICAL
    private String itemName;
    private String itemSku;
    private LocalDateTime timestamp;
}
