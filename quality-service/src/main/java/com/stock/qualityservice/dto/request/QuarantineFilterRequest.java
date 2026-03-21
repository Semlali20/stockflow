package com.stock.qualityservice.dto.request;

import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.entity.QuarantineStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineFilterRequest {

    private String itemId;
    private String lotId;
    private QuarantineStatus status;
    private Disposition disposition;
    private String inspectorId;
    private String locationId;
    private String severity;
    private LocalDateTime entryDateFrom;
    private LocalDateTime entryDateTo;
    private Boolean isOverdue;
}