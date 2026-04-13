package com.stock.inventoryservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockBelowThresholdEvent implements Serializable {

    private static final long serialVersionUID = 1L;

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
