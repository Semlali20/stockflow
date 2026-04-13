package com.stock.movementservice.dto.response;

import com.stock.movementservice.entity.enums.LineStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementLineResponseDto {

    private UUID id;

    // Foreign Keys
    private UUID movementId;

    private UUID itemId;

    // Quantities
    private Double requestedQuantity;

    private Double actualQuantity;

    private String uom;

    // Tracking
    private UUID lotId;

    private UUID serialId;

    private UUID fromLocationId;

    private UUID toLocationId;

    // Status
    private LineStatus status;

    private Integer lineNumber;

    // Documentation
    private String notes;

    private String reason;

    // Audit
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Computed fields
    private Double varianceQuantity; // actualQuantity - requestedQuantity
}
