package com.stock.movementservice.dto.response;

import com.stock.movementservice.entity.enums.TaskStatus;
import com.stock.movementservice.entity.enums.TaskType;
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
public class MovementTaskResponseDto {

    private UUID id;

    // Foreign Keys
    private UUID movementId;

    private UUID movementLineId;

    private UUID assignedUserId;

    // Task Details
    private TaskType taskType;

    private TaskStatus status;

    private Integer priority;

    // Timing
    private LocalDateTime scheduledStartTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime expectedCompletionTime;

    private LocalDateTime actualCompletionTime;

    // Location
    private UUID locationId;

    // Documentation
    private String instructions;

    private String notes;

    // Audit
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Computed fields
    private Long durationMinutes; // actualCompletionTime - actualStartTime in minutes
    private Boolean isOverdue;
}
