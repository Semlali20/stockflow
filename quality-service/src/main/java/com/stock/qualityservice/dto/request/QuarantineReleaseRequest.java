package com.stock.qualityservice.dto.request;

import com.stock.qualityservice.entity.Disposition;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineReleaseRequest {

    @NotNull(message = "Disposition is required")
    private Disposition disposition;

    private String releaseNotes;

    private String releasedBy;
}