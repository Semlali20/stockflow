package com.stock.movementservice.event;

import com.stock.movementservice.entity.enums.TaskType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class TaskCompletedEvent extends BaseMovementEvent {
    private UUID taskId;
    private UUID movementId;
    private UUID assignedUserId;
    private TaskType taskType;
    private LocalDateTime completedAt;
    private Long durationMinutes;

    public TaskCompletedEvent(UUID taskId, UUID movementId, UUID assignedUserId,
                              TaskType taskType, LocalDateTime completedAt,
                              Long durationMinutes, UUID userId) {
        super("TASK_COMPLETED", userId);
        this.taskId = taskId;
        this.movementId = movementId;
        this.assignedUserId = assignedUserId;
        this.taskType = taskType;
        this.completedAt = completedAt;
        this.durationMinutes = durationMinutes;
    }
}
