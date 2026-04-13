package com.stock.movementservice.dto.response;

import com.stock.movementservice.entity.enums.MovementPriority;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
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
public class MovementResponseDto {

    private UUID id;

    // Basic Information
    private MovementType type;

    private LocalDateTime movementDate;

    private MovementStatus status;

    private MovementPriority priority;

    // Dates
    private LocalDateTime expectedDate;

    private LocalDateTime actualDate;

    private LocalDateTime scheduledDate;

    // References
    private UUID sourceLocationId;

    private UUID destinationLocationId;

    private UUID sourceUserId;

    private UUID destinationUserId;

    private UUID warehouseId;

    // Documentation
    private String referenceNumber;

    private String notes;

    private String reason;

    // Tracking
    private UUID createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private UUID completedBy;

    private LocalDateTime completedAt;

    // Relationships
    @Builder.Default
    private List<MovementLineResponseDto> lines = new ArrayList<>();

    @Builder.Default
    private List<MovementTaskResponseDto> tasks = new ArrayList<>();

    // Computed fields
    private Integer totalLines;

    private Integer completedLines;

    private Integer pendingTasks;
}
