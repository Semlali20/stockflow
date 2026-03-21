package com.stock.movementservice.controller;

import com.stock.movementservice.dto.request.MovementTaskRequestDto;
import com.stock.movementservice.dto.response.MovementTaskResponseDto;
import com.stock.movementservice.entity.enums.TaskStatus;
import com.stock.movementservice.service.MovementTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/movement-tasks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movement Task Management", description = "APIs for managing movement tasks")
public class MovementTaskController {

    private final MovementTaskService taskService;

    /**
     * Create task
     */
    @PostMapping("/movement/{movementId}")
    @Operation(summary = "Create task", description = "Creates a new task for a movement")
    public ResponseEntity<MovementTaskResponseDto> createTask(
            @Parameter(description = "Movement ID") @PathVariable UUID movementId,
            @Valid @RequestBody MovementTaskRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to create task for movement: {} by user: {}", movementId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementTaskResponseDto response = taskService.createTask(movementId, requestDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get task by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieves a task by its ID")
    public ResponseEntity<MovementTaskResponseDto> getTaskById(
            @Parameter(description = "Task ID") @PathVariable UUID id) {

        log.info("REST request to get task: {}", id);

        MovementTaskResponseDto response = taskService.getTaskById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get tasks by movement
     */
    @GetMapping("/movement/{movementId}")
    @Operation(summary = "Get tasks by movement", description = "Retrieves all tasks for a specific movement")
    public ResponseEntity<List<MovementTaskResponseDto>> getTasksByMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID movementId) {

        log.info("REST request to get tasks for movement: {}", movementId);

        List<MovementTaskResponseDto> response = taskService.getTasksByMovement(movementId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get tasks by assigned user
     */
    @GetMapping("/assigned-to/{userId}")
    @Operation(summary = "Get tasks by assigned user", description = "Retrieves all tasks assigned to a specific user")
    public ResponseEntity<List<MovementTaskResponseDto>> getTasksByAssignedUser(
            @Parameter(description = "User ID") @PathVariable UUID userId) {

        log.info("REST request to get tasks assigned to user: {}", userId);

        List<MovementTaskResponseDto> response = taskService.getTasksByAssignedUser(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get tasks by status
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "Get tasks by status", description = "Retrieves all tasks with a specific status")
    public ResponseEntity<List<MovementTaskResponseDto>> getTasksByStatus(
            @Parameter(description = "Task status") @PathVariable TaskStatus status) {

        log.info("REST request to get tasks with status: {}", status);

        List<MovementTaskResponseDto> response = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(response);
    }

    /**
     * Get unassigned tasks
     */
    @GetMapping("/unassigned")
    @Operation(summary = "Get unassigned tasks", description = "Retrieves all tasks that have not been assigned to a user")
    public ResponseEntity<List<MovementTaskResponseDto>> getUnassignedTasks() {
        log.info("REST request to get unassigned tasks");

        List<MovementTaskResponseDto> response = taskService.getUnassignedTasks();
        return ResponseEntity.ok(response);
    }

    /**
     * Assign task to user
     */
    @PostMapping("/{taskId}/assign")
    @Operation(summary = "Assign task", description = "Assigns a task to a user")
    public ResponseEntity<MovementTaskResponseDto> assignTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Parameter(description = "User ID to assign task to") @RequestParam UUID assignToUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to assign task: {} to user: {} by user: {}",
                taskId, assignToUserId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementTaskResponseDto response = taskService.assignTask(taskId, assignToUserId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Start task
     */
    @PostMapping("/{taskId}/start")
    @Operation(summary = "Start task", description = "Starts a task (changes status to IN_PROGRESS)")
    public ResponseEntity<MovementTaskResponseDto> startTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to start task: {} by user: {}", taskId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementTaskResponseDto response = taskService.startTask(taskId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete task
     */
    @PostMapping("/{taskId}/complete")
    @Operation(summary = "Complete task", description = "Completes a task (changes status to COMPLETED)")
    public ResponseEntity<MovementTaskResponseDto> completeTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to complete task: {} by user: {}", taskId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementTaskResponseDto response = taskService.completeTask(taskId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel task
     */
    @PostMapping("/{taskId}/cancel")
    @Operation(summary = "Cancel task", description = "Cancels a task")
    public ResponseEntity<MovementTaskResponseDto> cancelTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Parameter(description = "Cancellation reason") @RequestParam String reason,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to cancel task: {} by user: {}", taskId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementTaskResponseDto response = taskService.cancelTask(taskId, reason, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update task
     */
    @PutMapping("/{taskId}")
    @Operation(summary = "Update task", description = "Updates an existing task")
    public ResponseEntity<MovementTaskResponseDto> updateTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Valid @RequestBody MovementTaskRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to update task: {} by user: {}", taskId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementTaskResponseDto response = taskService.updateTask(taskId, requestDto, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete task
     */
    @DeleteMapping("/{taskId}")
    @Operation(summary = "Delete task", description = "Deletes a task")
    public ResponseEntity<Void> deleteTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to delete task: {} by user: {}", taskId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        taskService.deleteTask(taskId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get overdue tasks
     */
    @GetMapping("/overdue")
    @Operation(summary = "Get overdue tasks", description = "Retrieves all tasks that are past their expected completion time")
    public ResponseEntity<List<MovementTaskResponseDto>> getOverdueTasks() {
        log.info("REST request to get overdue tasks");

        List<MovementTaskResponseDto> response = taskService.getOverdueTasks();
        return ResponseEntity.ok(response);
    }

    /**
     * Get tasks scheduled for today
     */
    @GetMapping("/scheduled-today")
    @Operation(summary = "Get tasks scheduled for today", description = "Retrieves all tasks scheduled for today")
    public ResponseEntity<List<MovementTaskResponseDto>> getTasksScheduledForToday() {
        log.info("REST request to get tasks scheduled for today");

        List<MovementTaskResponseDto> response = taskService.getTasksScheduledForToday();
        return ResponseEntity.ok(response);
    }

    /**
     * Get user's tasks for today in warehouse
     */
    @GetMapping("/my-tasks-today")
    @Operation(summary = "Get user's tasks for today",
            description = "Retrieves tasks assigned to a user for today in a specific warehouse")
    public ResponseEntity<List<MovementTaskResponseDto>> getUserTasksForToday(
            @Parameter(description = "User ID") @RequestParam UUID userId,
            @Parameter(description = "Warehouse ID") @RequestParam UUID warehouseId) {

        log.info("REST request to get tasks for user: {} in warehouse: {} for today", userId, warehouseId);

        List<MovementTaskResponseDto> response = taskService.getUserTasksForToday(userId, warehouseId);
        return ResponseEntity.ok(response);
    }
}
