package com.stock.qualityservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineUpdateRequest {

    private Double quantity;
    private String locationId;
    private String reason;
    private String inspectorId;
    private String qualityProfileId;
    private LocalDateTime expectedReleaseDate;
    private String severity;
    private String notes;
}