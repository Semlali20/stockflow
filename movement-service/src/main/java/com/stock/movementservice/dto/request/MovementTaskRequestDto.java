package com.stock.movementservice.dto.request;


import com.stock.movementservice.entity.enums.TaskStatus;
import com.stock.movementservice.entity.enums.TaskType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class MovementTaskRequestDto {

    private UUID movementLineId;

    private UUID assignedUserId;

    @NotNull(message = "Task type is required")
    private TaskType taskType;

    private TaskStatus status;

    @Min(value = 1, message = "Priority must be at least 1")
    @Max(value = 10, message = "Priority must not exceed 10")
    @Builder.Default
    private Integer priority = 5;

    // Timing
    private LocalDateTime scheduledStartTime;

    private LocalDateTime expectedCompletionTime;

    // Location
    private UUID locationId;

    // Documentation
    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    private String instructions;

    @Size(max = 5000, message = "Notes must not exceed 5000 characters")
    private String notes;
}
