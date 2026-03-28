package com.stock.salesservice.dto.response;

import com.stock.salesservice.enums.QuoteStatus;
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
public class QuoteResponse {

    private UUID id;
    private String reference;
    private String customerId;
    private String customerName;
    private QuoteStatus status;
    private LocalDate validUntil;
    private String notes;
    private String inventoryId;
    private String locationId;
    private BigDecimal discountPercent;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<QuoteLineResponse> lines = new ArrayList<>();
}
