package com.stock.qualityservice.dto.response;

import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.entity.QuarantineStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineResponse {

    private String id;
    private String quarantineNumber;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private String locationId;
    private QuarantineStatus status;
    private String reason;
    private String inspectorId;
    private String qualityProfileId;
    private LocalDateTime entryDate;
    private LocalDateTime expectedReleaseDate;
    private LocalDateTime actualReleaseDate;
    private String releaseNotes;
    private Disposition disposition;
    private String severity;
    private String quarantineType;
    private String notes;
    private String relatedInspectionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}