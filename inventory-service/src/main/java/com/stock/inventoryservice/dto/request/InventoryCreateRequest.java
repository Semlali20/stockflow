package com.stock.inventoryservice.dto.request;

import com.stock.inventoryservice.entity.InventoryStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCreateRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId;

    @NotBlank(message = "Warehouse ID is required")
    private String warehouseId;

    @NotBlank(message = "Location ID is required")
    private String locationId;

    private String lotId; // Optional
    private String serialId; // Optional

    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Double quantityOnHand;

    @Min(value = 0, message = "Reserved quantity cannot be negative")
    private Double quantityReserved = 0.0;

    @Min(value = 0, message = "Damaged quantity cannot be negative")
    private Double quantityDamaged = 0.0;

    @NotBlank(message = "Unit of measure is required")
    @Size(max = 20, message = "UOM must be 20 characters or less")
    private String uom;

    @NotNull(message = "Status is required")
    private InventoryStatus status;

    @DecimalMin(value = "0.0", message = "Unit cost cannot be negative")
    private BigDecimal unitCost;

    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;

    @Past(message = "Manufacture date must be in the past")
    private LocalDate manufactureDate;

    private String attributes; // JSON string for custom fields
}
