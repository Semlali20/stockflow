package com.stock.movementservice.service;

import com.stock.movementservice.dto.request.MovementTaskRequestDto;
import com.stock.movementservice.dto.response.MovementTaskResponseDto;
import com.stock.movementservice.entity.enums.TaskStatus;
import com.stock.movementservice.entity.enums.TaskType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MovementTaskService {

    /**
     * Create task
     */
    MovementTaskResponseDto createTask(UUID movementId, MovementTaskRequestDto requestDto, UUID userId);

    /**
     * Get task by ID
     */
    MovementTaskResponseDto getTaskById(UUID id);

    /**
     * Get tasks by movement
     */
    List<MovementTaskResponseDto> getTasksByMovement(UUID movementId);

    /**
     * Get tasks by assigned user
     */
    List<MovementTaskResponseDto> getTasksByAssignedUser(UUID userId);

    /**
     * Get tasks by status
     */
    List<MovementTaskResponseDto> getTasksByStatus(TaskStatus status);

    /**
     * Get unassigned tasks
     */
    List<MovementTaskResponseDto> getUnassignedTasks();

    /**
     * Assign task to user
     */
    MovementTaskResponseDto assignTask(UUID taskId, UUID userId, UUID assignedBy);

    /**
     * Start task
     */
    MovementTaskResponseDto startTask(UUID taskId, UUID userId);

    /**
     * Complete task
     */
    MovementTaskResponseDto completeTask(UUID taskId, UUID userId);

    /**
     * Cancel task
     */
    MovementTaskResponseDto cancelTask(UUID taskId, String reason, UUID userId);

    /**
     * Update task
     */
    MovementTaskResponseDto updateTask(UUID taskId, MovementTaskRequestDto requestDto, UUID userId);

    /**
     * Delete task
     */
    void deleteTask(UUID taskId, UUID userId);

    /**
     * Get overdue tasks
     */
    List<MovementTaskResponseDto> getOverdueTasks();

    /**
     * Get tasks scheduled for today
     */
    List<MovementTaskResponseDto> getTasksScheduledForToday();

    /**
     * Get user's tasks for today in warehouse
     */
    List<MovementTaskResponseDto> getUserTasksForToday(UUID userId, UUID warehouseId);
}
