package com.stock.qualityservice.event;

import com.stock.qualityservice.entity.Disposition;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityApprovalEvent {

    private String eventId;
    private String eventType; // ITEM_APPROVED, ITEM_REJECTED, ITEM_CONDITIONAL_APPROVED
    private LocalDateTime eventTime;

    private String inspectionId;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private Disposition disposition;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String reason;
    private String correctiveAction;
}