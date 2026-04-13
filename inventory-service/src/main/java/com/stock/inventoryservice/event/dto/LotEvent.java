package com.stock.inventoryservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LotEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String lotId;
    private String lotCode;
    private String itemId;
    private String lotNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private String supplierId;
    private String status;

    // Event metadata
    private String eventType; // CREATED, UPDATED, DELETED, STATUS_CHANGED
    private String userId;
    private LocalDateTime timestamp;
}
