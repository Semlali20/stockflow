package com.stock.movementservice.event;

import com.stock.movementservice.entity.enums.TaskType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class TaskAssignedEvent extends BaseMovementEvent {
    private UUID taskId;
    private UUID movementId;
    private UUID assignedUserId;
    private TaskType taskType;
    private UUID locationId;
    private Integer priority;

    public TaskAssignedEvent(UUID taskId, UUID movementId, UUID assignedUserId,
                             TaskType taskType, UUID locationId, Integer priority, UUID userId) {
        super("TASK_ASSIGNED", userId);
        this.taskId = taskId;
        this.movementId = movementId;
        this.assignedUserId = assignedUserId;
        this.taskType = taskType;
        this.locationId = locationId;
        this.priority = priority;
    }
}
