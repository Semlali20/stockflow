package com.stock.movementservice.dto.request;

import com.stock.movementservice.entity.enums.LineStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementLineRequestDto {

    @NotNull(message = "Item ID is required")
    private UUID itemId;

    @NotNull(message = "Requested quantity is required")
    @Min(value = 0, message = "Requested quantity must be greater than or equal to 0")
    private Double requestedQuantity;

    @Min(value = 0, message = "Actual quantity must be greater than or equal to 0")
    private Double actualQuantity;

    @Size(max = 20, message = "UOM must not exceed 20 characters")
    private String uom;

    // Tracking
    private UUID lotId;

    private UUID serialId;

    private UUID fromLocationId;

    private UUID toLocationId;

    // Status
    private LineStatus status;

    @NotNull(message = "Line number is required")
    @Min(value = 1, message = "Line number must be at least 1")
    private Integer lineNumber;

    // Documentation
    @Size(max = 5000, message = "Notes must not exceed 5000 characters")
    private String notes;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
