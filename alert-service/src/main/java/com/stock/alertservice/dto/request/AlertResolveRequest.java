package com.stock.alertservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResolveRequest {

    @NotBlank(message = "Resolution comment is required")
    @Size(max = 1000, message = "Resolution comment cannot exceed 1000 characters")
    private String resolutionComment;

    private String actionTaken;
}
