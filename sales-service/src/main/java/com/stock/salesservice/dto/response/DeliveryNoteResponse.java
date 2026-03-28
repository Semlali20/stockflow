package com.stock.salesservice.dto.response;

import com.stock.salesservice.enums.DeliveryNoteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryNoteResponse {

    private UUID id;
    private String reference;
    private String quoteId;
    private String customerId;
    private String customerName;
    private DeliveryNoteStatus status;
    private LocalDate deliveryDate;
    private String deliveryAddress;
    private String notes;
    private String inventoryId;
    private String locationId;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<DeliveryNoteLineResponse> lines = new ArrayList<>();
}
