package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemApprovedEvent {

    private String eventId;
    private String eventType = "ITEM_APPROVED";
    private LocalDateTime eventTime;

    private String inspectionId;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String qualityProfileId;
    private Boolean canMoveToActiveInventory;
}