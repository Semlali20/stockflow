package com.stock.salesservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteRequest {

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    private String customerName;

    private LocalDate validUntil;

    private String notes;

    private String inventoryId;

    @Builder.Default
    @DecimalMin(value = "0.0", inclusive = true, message = "Discount percent must be non-negative")
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Valid
    @NotEmpty(message = "At least one quote line is required")
    @Builder.Default
    private List<QuoteLineRequest> lines = new ArrayList<>();
}
