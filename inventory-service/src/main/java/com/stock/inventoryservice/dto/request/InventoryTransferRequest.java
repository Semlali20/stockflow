package com.stock.inventoryservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransferRequest {
    @NotBlank(message = "Source location ID is required")
    private String sourceLocationId;

    @NotBlank(message = "Destination location ID is required")
    private String destinationLocationId;

    @NotBlank(message = "Item variant ID is required")
    private String itemVariantId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    private String lotNumber;
    private String serialNumber;
    private String reason;
    private String notes;
}
