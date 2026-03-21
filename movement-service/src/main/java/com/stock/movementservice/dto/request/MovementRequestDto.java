package com.stock.movementservice.dto.request;


import com.stock.movementservice.entity.enums.MovementPriority;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementRequestDto {

    @NotNull(message = "Movement type is required")
    private MovementType type;

    private LocalDateTime movementDate;

    private MovementStatus status;

    @Builder.Default
    private MovementPriority priority = MovementPriority.NORMAL;

    private LocalDateTime expectedDate;

    private LocalDateTime scheduledDate;

    // Location/User References
    private UUID sourceLocationId;

    private UUID destinationLocationId;

    private UUID sourceUserId;

    private UUID destinationUserId;

    @NotNull(message = "Warehouse ID is required")
    private UUID warehouseId;

    // Documentation
    @Size(max = 100, message = "Reference number must not exceed 100 characters")
    private String referenceNumber;

    @Size(max = 5000, message = "Notes must not exceed 5000 characters")
    private String notes;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;

    // Lines
    @Valid
    @Size(min = 1, message = "At least one movement line is required")
    @Builder.Default
    private List<MovementLineRequestDto> lines = new ArrayList<>();

    // Tasks (optional)
    @Valid
    @Builder.Default
    private List<MovementTaskRequestDto> tasks = new ArrayList<>();
}
