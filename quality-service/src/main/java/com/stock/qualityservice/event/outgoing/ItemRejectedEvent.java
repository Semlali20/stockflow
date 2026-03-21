package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemRejectedEvent {

    private String eventId;
    private String eventType = "ITEM_REJECTED";
    private LocalDateTime eventTime;

    private String inspectionId;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private String rejectionReason;
    private String correctiveAction;
    private String rejectedBy;
    private LocalDateTime rejectedAt;
    private Boolean requiresReturn; // Return to supplier
    private Boolean requiresScrap;
}