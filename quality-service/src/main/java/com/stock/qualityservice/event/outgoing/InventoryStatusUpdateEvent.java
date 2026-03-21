package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStatusUpdateEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private UUID eventId;
    private String eventType;
    private LocalDateTime eventTime;

    private UUID itemId;
    private UUID lotId;
    private UUID serialId;
    private String oldStatus;
    private String newStatus;
    private String reason;
    private String updatedBy;
}