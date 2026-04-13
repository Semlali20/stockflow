package com.stock.movementservice.dto.mapper;

import com.stock.movementservice.dto.request.MovementRequestDto;
import com.stock.movementservice.dto.response.MovementResponseDto;
import com.stock.movementservice.dto.response.MovementSummaryDto;
import com.stock.movementservice.entity.Movement;
import com.stock.movementservice.entity.enums.LineStatus;
import com.stock.movementservice.entity.enums.TaskStatus;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class MovementMapper {

    private final MovementLineMapper lineMapper;
    private final MovementTaskMapper taskMapper;

    public MovementMapper(MovementLineMapper lineMapper, MovementTaskMapper taskMapper) {
        this.lineMapper = lineMapper;
        this.taskMapper = taskMapper;
    }

    public Movement toEntity(MovementRequestDto dto) {
        if (dto == null) {
            return null;
        }

        Movement movement = Movement.builder()
                .type(dto.getType())
                .movementDate(dto.getMovementDate())
                .status(dto.getStatus())
                .priority(dto.getPriority())
                .expectedDate(dto.getExpectedDate())
                .scheduledDate(dto.getScheduledDate())
                .sourceLocationId(dto.getSourceLocationId())
                .destinationLocationId(dto.getDestinationLocationId())
                .sourceUserId(dto.getSourceUserId())
                .destinationUserId(dto.getDestinationUserId())
                .warehouseId(dto.getWarehouseId())
                .referenceNumber(dto.getReferenceNumber())
                .notes(dto.getNotes())
                .reason(dto.getReason())
                .build();

        // Map lines
        if (dto.getLines() != null) {
            dto.getLines().forEach(lineDto -> {
                movement.addLine(lineMapper.toEntity(lineDto));
            });
        }

        // Map tasks
        if (dto.getTasks() != null) {
            dto.getTasks().forEach(taskDto -> {
                movement.addTask(taskMapper.toEntity(taskDto));
            });
        }

        return movement;
    }

    public MovementResponseDto toResponseDto(Movement entity) {
        if (entity == null) {
            return null;
        }

        return MovementResponseDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .movementDate(entity.getMovementDate())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .expectedDate(entity.getExpectedDate())
                .actualDate(entity.getActualDate())
                .scheduledDate(entity.getScheduledDate())
                .sourceLocationId(entity.getSourceLocationId())
                .destinationLocationId(entity.getDestinationLocationId())
                .sourceUserId(entity.getSourceUserId())
                .destinationUserId(entity.getDestinationUserId())
                .warehouseId(entity.getWarehouseId())
                .referenceNumber(entity.getReferenceNumber())
                .notes(entity.getNotes())
                .reason(entity.getReason())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .completedBy(entity.getCompletedBy())
                .completedAt(entity.getCompletedAt())
                .lines(entity.getLines().stream()
                        .map(lineMapper::toResponseDto)
                        .collect(Collectors.toList()))
                .tasks(entity.getTasks().stream()
                        .map(taskMapper::toResponseDto)
                        .collect(Collectors.toList()))
                .totalLines(entity.getLines().size())
                .completedLines((int) entity.getLines().stream()
                        .filter(line -> line.getStatus() == LineStatus.COMPLETED)
                        .count())
                .pendingTasks((int) entity.getTasks().stream()
                        .filter(task -> task.getStatus() == TaskStatus.PENDING ||
                                task.getStatus() == TaskStatus.ASSIGNED)
                        .count())
                .build();
    }

    public MovementSummaryDto toSummaryDto(Movement entity) {
        if (entity == null) {
            return null;
        }

        return MovementSummaryDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .movementDate(entity.getMovementDate())
                .expectedDate(entity.getExpectedDate())
                .referenceNumber(entity.getReferenceNumber())
                .warehouseId(entity.getWarehouseId())
                .sourceLocationId(entity.getSourceLocationId())
                .destinationLocationId(entity.getDestinationLocationId())
                .totalLines(entity.getLines().size())
                .completedLines((int) entity.getLines().stream()
                        .filter(line -> line.getStatus() == LineStatus.COMPLETED)
                        .count())
                .totalTasks(entity.getTasks().size())
                .completedTasks((int) entity.getTasks().stream()
                        .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                        .count())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .build();
    }
}
