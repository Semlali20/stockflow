package com.stock.purchaseservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderRequest {

    @NotNull(message = "Supplier ID is required")
    private String supplierId;

    private String supplierName;

    private LocalDate expectedDeliveryDate;

    private String notes;

    private String inventoryId;

    @NotEmpty(message = "At least one order line is required")
    @Valid
    private List<PurchaseOrderLineRequest> lines;
}
