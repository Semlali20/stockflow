package com.stock.alertservice.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertAcknowledgeRequest {

    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String comment;

    private String assignedTo;
}
