// inventory-service/src/main/java/com/stock/inventoryservice/dto/request/InventoryUpdateRequest.java
package com.stock.inventoryservice.dto.request;

import com.stock.inventoryservice.entity.InventoryStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
public class InventoryUpdateRequest {

    // Only fields that can be updated

    @Min(value = 0, message = "Quantity cannot be negative")
    private Double quantityOnHand;

    @Min(value = 0, message = "Reserved quantity cannot be negative")
    private Double quantityReserved;

    @Min(value = 0, message = "Damaged quantity cannot be negative")
    private Double quantityDamaged;

    private InventoryStatus status;

    @DecimalMin(value = "0.0", message = "Unit cost cannot be negative")
    private BigDecimal unitCost;

    private LocalDate expiryDate;
    private LocalDate lastCountDate;
    private String attributes;
}
