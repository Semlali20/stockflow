package com.stock.movementservice.dto.response;

import com.stock.movementservice.entity.enums.MovementPriority;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
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
public class MovementSummaryDto {

    private UUID id;

    private MovementType type;

    private MovementStatus status;

    private MovementPriority priority;

    private LocalDateTime movementDate;

    private LocalDateTime expectedDate;

    private String referenceNumber;

    private UUID warehouseId;

    private UUID sourceLocationId;

    private UUID destinationLocationId;

    private Integer totalLines;

    private Integer completedLines;

    private Integer totalTasks;

    private Integer completedTasks;

    private LocalDateTime createdAt;

    private UUID createdBy;
}
