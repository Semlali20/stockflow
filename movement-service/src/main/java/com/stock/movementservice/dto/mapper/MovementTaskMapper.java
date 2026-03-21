package com.stock.movementservice.dto.mapper;

import com.stock.movementservice.dto.request.MovementTaskRequestDto;
import com.stock.movementservice.dto.response.MovementTaskResponseDto;
import com.stock.movementservice.entity.MovementTask;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class MovementTaskMapper {

    public MovementTask toEntity(MovementTaskRequestDto dto) {
        if (dto == null) {
            return null;
        }

        return MovementTask.builder()
                .movementLineId(dto.getMovementLineId())
                .assignedUserId(dto.getAssignedUserId())
                .taskType(dto.getTaskType())
                .status(dto.getStatus())
                .priority(dto.getPriority())
                .scheduledStartTime(dto.getScheduledStartTime())
                .expectedCompletionTime(dto.getExpectedCompletionTime())
                .locationId(dto.getLocationId())
                .instructions(dto.getInstructions())
                .notes(dto.getNotes())
                .build();
    }

    public MovementTaskResponseDto toResponseDto(MovementTask entity) {
        if (entity == null) {
            return null;
        }

        Long durationMinutes = null;
        if (entity.getActualStartTime() != null && entity.getActualCompletionTime() != null) {
            durationMinutes = Duration.between(
                    entity.getActualStartTime(),
                    entity.getActualCompletionTime()
            ).toMinutes();
        }

        Boolean isOverdue = false;
        if (entity.getExpectedCompletionTime() != null &&
                entity.getActualCompletionTime() == null) {
            isOverdue = LocalDateTime.now().isAfter(entity.getExpectedCompletionTime());
        }

        return MovementTaskResponseDto.builder()
                .id(entity.getId())
                .movementId(entity.getMovement() != null ? entity.getMovement().getId() : null)
                .movementLineId(entity.getMovementLineId())
                .assignedUserId(entity.getAssignedUserId())
                .taskType(entity.getTaskType())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .scheduledStartTime(entity.getScheduledStartTime())
                .actualStartTime(entity.getActualStartTime())
                .expectedCompletionTime(entity.getExpectedCompletionTime())
                .actualCompletionTime(entity.getActualCompletionTime())
                .locationId(entity.getLocationId())
                .instructions(entity.getInstructions())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .durationMinutes(durationMinutes)
                .isOverdue(isOverdue)
                .build();
    }
}
