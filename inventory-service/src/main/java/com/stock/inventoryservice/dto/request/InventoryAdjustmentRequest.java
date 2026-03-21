// inventory-service/src/main/java/com/stock/inventoryservice/dto/request/InventoryAdjustmentRequest.java
package com.stock.inventoryservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request for adjusting inventory quantities
 * Used for cycle counts, physical adjustments, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAdjustmentRequest {

    @NotNull(message = "New quantity is required")
    private Double newQuantity;

    @NotBlank(message = "Reason is required")
    private String reason; // CYCLE_COUNT, DAMAGED, LOST, FOUND, CORRECTION

    private String notes;
    private String referenceId; // External reference (e.g., cycle count ID)
}
