package com.stock.inventoryservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to reserve inventory for an order or operation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReserveRequest {

    @NotNull(message = "Quantity to reserve is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Double quantityToReserve;

    @NotBlank(message = "Reference type is required")
    private String referenceType; // ORDER, TRANSFER, PRODUCTION

    @NotBlank(message = "Reference ID is required")
    private String referenceId; // Order ID, Transfer ID, etc.

    private String notes;
}
