package com.stock.purchaseservice.dto.response;

import com.stock.purchaseservice.enums.PurchaseOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderResponse {

    private UUID id;
    private String reference;
    private String supplierId;
    private String supplierName;
    private PurchaseOrderStatus status;
    private LocalDate expectedDeliveryDate;
    private String notes;
    private String inventoryId;
    private BigDecimal totalAmount;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<PurchaseOrderLineResponse> lines = new ArrayList<>();

    // Computed summary fields
    private Integer totalLines;
    private Integer fullyReceivedLines;
    private Integer partiallyReceivedLines;
}
