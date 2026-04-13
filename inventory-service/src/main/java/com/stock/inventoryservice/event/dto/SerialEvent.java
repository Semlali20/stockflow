package com.stock.inventoryservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SerialEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String serialId;
    private String serialCode;
    private String itemId;
    private String serialNumber;
    private String lotId;
    private String locationId;
    private String status;

    // Event metadata
    private String eventType; // CREATED, UPDATED, DELETED, STATUS_CHANGED, LOCATION_CHANGED
    private String userId;
    private LocalDateTime timestamp;
}
