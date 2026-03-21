package com.stock.alertservice.dto.cache;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventorySnapshotDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String inventoryId;
    private String itemId;
    private String locationId;
    private Double quantity;
    private String status;

    private Double minThreshold;
    private Double maxThreshold;
    private Double reorderPoint;

    private LocalDateTime cachedAt;
    private LocalDateTime lastMovementAt;
    private String source;
}
