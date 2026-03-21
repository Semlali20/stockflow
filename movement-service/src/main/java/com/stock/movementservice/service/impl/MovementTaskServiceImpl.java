package com.stock.movementservice.service.impl;

import com.stock.movementservice.dto.mapper.MovementTaskMapper;
import com.stock.movementservice.dto.request.MovementTaskRequestDto;
import com.stock.movementservice.dto.response.MovementTaskResponseDto;
import com.stock.movementservice.entity.Movement;
import com.stock.movementservice.entity.MovementTask;
import com.stock.movementservice.entity.enums.TaskStatus;
import com.stock.movementservice.entity.enums.TaskType;
import com.stock.movementservice.event.TaskAssignedEvent;
import com.stock.movementservice.event.TaskCompletedEvent;
import com.stock.movementservice.exception.InvalidMovementStateException;
import com.stock.movementservice.exception.MovementNotFoundException;
import com.stock.movementservice.exception.MovementTaskNotFoundException;
import com.stock.movementservice.repository.MovementRepository;
import com.stock.movementservice.repository.MovementTaskRepository;
import com.stock.movementservice.service.EventPublisherService;
import com.stock.movementservice.service.MovementTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MovementTaskServiceImpl implements MovementTaskService {

    private final MovementTaskRepository taskRepository;
    private final MovementRepository movementRepository;
    private final MovementTaskMapper taskMapper;
    private final EventPublisherService eventPublisher;

    @Override
    public MovementTaskResponseDto createTask(UUID movementId, MovementTaskRequestDto requestDto, UUID userId) {
        log.info("Creating task for movement: {}", movementId);

        Movement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new MovementNotFoundException(movementId));

        MovementTask task = taskMapper.toEntity(requestDto);
        movement.addTask(task);

        movementRepository.save(movement);

        log.info("Task created successfully for movement: {}", movementId);

        return taskMapper.toResponseDto(task);
    }

    @Override
    @Transactional(readOnly = true)
    public MovementTaskResponseDto getTaskById(UUID id) {
        log.info("Fetching task with ID: {}", id);

        MovementTask task = taskRepository.findById(id)
                .orElseThrow(() -> new MovementTaskNotFoundException(id));

        return taskMapper.toResponseDto(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementTaskResponseDto> getTasksByMovement(UUID movementId) {
        log.info("Fetching tasks for movement: {}", movementId);

        List<MovementTask> tasks = taskRepository.findByMovement_Id(movementId);

        return tasks.stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementTaskResponseDto> getTasksByAssignedUser(UUID userId) {
        log.info("Fetching tasks assigned to user: {}", userId);

        List<MovementTask> tasks = taskRepository.findByAssignedUserId(userId);

        return tasks.stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementTaskResponseDto> getTasksByStatus(TaskStatus status) {
        log.info("Fetching tasks with status: {}", status);

        List<MovementTask> tasks = taskRepository.findByStatus(status);

        return tasks.stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementTaskResponseDto> getUnassignedTasks() {
        log.info("Fetching unassigned tasks");

        List<MovementTask> tasks = taskRepository.findUnassignedTasks();

        return tasks.stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public MovementTaskResponseDto assignTask(UUID taskId, UUID userId, UUID assignedBy) {
        log.info("Assigning task: {} to user: {}", taskId, userId);

        MovementTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new MovementTaskNotFoundException(taskId));

        // Can only assign pending tasks
        if (task.getStatus() != TaskStatus.PENDING) {
            throw new InvalidMovementStateException(
                    task.getMovement().getId(),
                    null,
                    "assign task with status: " + task.getStatus()
            );
        }

        task.setAssignedUserId(userId);
        task.setStatus(TaskStatus.ASSIGNED);

        MovementTask updatedTask = taskRepository.save(task);

        // Publish task assigned event
        TaskAssignedEvent event = new TaskAssignedEvent(
                task.getId(),
                task.getMovement().getId(),
                userId,
                task.getTaskType(),
                task.getLocationId(),
                task.getPriority(),
                assignedBy
        );
        eventPublisher.publishTaskAssignedEvent(event);

        log.info("Task assigned successfully: {}", taskId);

        return taskMapper.toResponseDto(updatedTask);
    }

    @Override
    public MovementTaskResponseDto startTask(UUID taskId, UUID userId) {
        log.info("Starting task: {} by user: {}", taskId, userId);

        MovementTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new MovementTaskNotFoundException(taskId));

        // Can only start assigned tasks
        if (task.getStatus() != TaskStatus.ASSIGNED && task.getStatus() != TaskStatus.PENDING) {
            throw new InvalidMovementStateException(
                    task.getMovement().getId(),
                    null,
                    "start task with status: " + task.getStatus()
            );
        }

        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setActualStartTime(LocalDateTime.now());

        MovementTask updatedTask = taskRepository.save(task);

        log.info("Task started successfully: {}", taskId);

        return taskMapper.toResponseDto(updatedTask);
    }

    @Override
    public MovementTaskResponseDto completeTask(UUID taskId, UUID userId) {
        log.info("Completing task: {} by user: {}", taskId, userId);

        MovementTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new MovementTaskNotFoundException(taskId));

        // Can only complete in-progress tasks
        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new InvalidMovementStateException(
                    task.getMovement().getId(),
                    null,
                    "complete task with status: " + task.getStatus()
            );
        }

        LocalDateTime completionTime = LocalDateTime.now();
        task.setStatus(TaskStatus.COMPLETED);
        task.setActualCompletionTime(completionTime);

        MovementTask updatedTask = taskRepository.save(task);

        // Calculate duration
        Long durationMinutes = null;
        if (task.getActualStartTime() != null) {
            durationMinutes = Duration.between(task.getActualStartTime(), completionTime).toMinutes();
        }

        // Publish task completed event
        TaskCompletedEvent event = new TaskCompletedEvent(
                task.getId(),
                task.getMovement().getId(),
                task.getAssignedUserId(),
                task.getTaskType(),
                completionTime,
                durationMinutes,
                userId
        );
        eventPublisher.publishTaskCompletedEvent(event);

        log.info("Task completed successfully: {}", taskId);

        return taskMapper.toResponseDto(updatedTask);
    }

    @Override
    public MovementTaskResponseDto cancelTask(UUID taskId, String reason, UUID userId) {
        log.info("Cancelling task: {} by user: {}", taskId, userId);

        MovementTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new MovementTaskNotFoundException(taskId));

        // Cannot cancel completed tasks
        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new InvalidMovementStateException(
                    task.getMovement().getId(),
                    null,
                    "cancel completed task"
            );
        }

        task.setStatus(TaskStatus.CANCELLED);
        task.setNotes(task.getNotes() + "\nCancellation reason: " + reason);

        MovementTask updatedTask = taskRepository.save(task);

        log.info("Task cancelled successfully: {}", taskId);

        return taskMapper.toResponseDto(updatedTask);
    }

    @Override
    public MovementTaskResponseDto updateTask(UUID taskId, MovementTaskRequestDto requestDto, UUID userId) {
        log.info("Updating task: {}", taskId);

        MovementTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new MovementTaskNotFoundException(taskId));

        // Update fields
        if (requestDto.getAssignedUserId() != null) {
            task.setAssignedUserId(requestDto.getAssignedUserId());
        }

        if (requestDto.getTaskType() != null) {
            task.setTaskType(requestDto.getTaskType());
        }

        if (requestDto.getStatus() != null) {
            task.setStatus(requestDto.getStatus());
        }

        if (requestDto.getPriority() != null) {
            task.setPriority(requestDto.getPriority());
        }

        if (requestDto.getScheduledStartTime() != null) {
            task.setScheduledStartTime(requestDto.getScheduledStartTime());
        }

        if (requestDto.getExpectedCompletionTime() != null) {
            task.setExpectedCompletionTime(requestDto.getExpectedCompletionTime());
        }

        if (requestDto.getLocationId() != null) {
            task.setLocationId(requestDto.getLocationId());
        }

        if (requestDto.getInstructions() != null) {
            task.setInstructions(requestDto.getInstructions());
        }

        if (requestDto.getNotes() != null) {
            task.setNotes(requestDto.getNotes());
        }

        MovementTask updatedTask = taskRepository.save(task);

        log.info("Task updated successfully: {}", taskId);

        return taskMapper.toResponseDto(updatedTask);
    }

    @Override
    public void deleteTask(UUID taskId, UUID userId) {
        log.info("Deleting task: {}", taskId);

        MovementTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new MovementTaskNotFoundException(taskId));

        // Cannot delete completed tasks
        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new InvalidMovementStateException(
                    task.getMovement().getId(),
                    null,
                    "delete completed task"
            );
        }

        taskRepository.delete(task);

        log.info("Task deleted successfully: {}", taskId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementTaskResponseDto> getOverdueTasks() {
        log.info("Fetching overdue tasks");

        List<MovementTask> tasks = taskRepository.findOverdueTasks(LocalDateTime.now());

        return tasks.stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementTaskResponseDto> getTasksScheduledForToday() {
        log.info("Fetching tasks scheduled for today");

        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        List<MovementTask> tasks = taskRepository.findTasksScheduledForToday(startOfDay, endOfDay);

        return tasks.stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementTaskResponseDto> getUserTasksForToday(UUID userId, UUID warehouseId) {
        log.info("Fetching user tasks for today - User: {}, Warehouse: {}", userId, warehouseId);

        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        List<MovementTask> tasks = taskRepository.findUserTasksForToday(userId, warehouseId, startOfDay, endOfDay);

        return tasks.stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
