package com.stock.salesservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryNoteRequest {

    private String quoteId;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    private String customerName;

    private LocalDate deliveryDate;

    private String deliveryAddress;

    private String notes;

    private String inventoryId;

    @Valid
    @NotEmpty(message = "At least one delivery note line is required")
    @Builder.Default
    private List<DeliveryNoteLineRequest> lines = new ArrayList<>();
}
