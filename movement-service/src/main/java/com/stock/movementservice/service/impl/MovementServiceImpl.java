package com.stock.movementservice.service.impl;

import com.stock.movementservice.dto.mapper.MovementMapper;
import com.stock.movementservice.dto.request.MovementRequestDto;
import com.stock.movementservice.dto.request.MovementUpdateRequestDto;
import com.stock.movementservice.dto.response.MovementResponseDto;
import com.stock.movementservice.dto.response.MovementSummaryDto;
import com.stock.movementservice.entity.Movement;
import com.stock.movementservice.entity.enums.LineStatus;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
import com.stock.movementservice.event.MovementCancelledEvent;
import com.stock.movementservice.event.MovementCompletedEvent;
import com.stock.movementservice.event.MovementCreatedEvent;
import com.stock.movementservice.event.MovementKafkaEventPublisher;
import com.stock.movementservice.event.MovementStatusChangedEvent;
import com.stock.movementservice.exception.DuplicateReferenceNumberException;
import com.stock.movementservice.exception.InvalidMovementStateException;
import com.stock.movementservice.exception.MovementNotFoundException;
import com.stock.movementservice.repository.MovementRepository;
import com.stock.movementservice.service.MovementService;
import com.stock.movementservice.service.MovementValidationService;
import com.stock.movementservice.service.MovementQuantityValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MovementServiceImpl implements MovementService {

    private final MovementRepository movementRepository;
    private final MovementMapper movementMapper;
    private final MovementValidationService validationService;
    private final MovementKafkaEventPublisher kafkaEventPublisher;
    private final MovementQuantityValidationService quantityValidationService; // 🔥 NEW - Quantity validation

    @Override
    public MovementResponseDto createMovement(MovementRequestDto requestDto, UUID userId) {
        log.info("Creating new movement for user: {}", userId);

        // Validate request
        validationService.validateMovementRequest(requestDto);

        // Check for duplicate reference number
        if (requestDto.getReferenceNumber() != null &&
                movementRepository.existsByReferenceNumber(requestDto.getReferenceNumber())) {
            throw new DuplicateReferenceNumberException(requestDto.getReferenceNumber());
        }

        // 🔥 VALIDATE QUANTITIES if status is PENDING or IN_PROGRESS
        MovementStatus initialStatus = requestDto.getStatus() != null ? 
                                       requestDto.getStatus() : MovementStatus.DRAFT;
        
        if (initialStatus == MovementStatus.PENDING || initialStatus == MovementStatus.IN_PROGRESS) {
            log.info("🔍 Validating quantities for new movement with status: {}", initialStatus);
            quantityValidationService.validateMovementQuantities(requestDto);
        }

        // Map DTO to entity
        Movement movement = movementMapper.toEntity(requestDto);
        movement.setCreatedBy(userId);

        // Set default status if not provided
        if (movement.getStatus() == null) {
            movement.setStatus(MovementStatus.DRAFT);
        }

        // Save movement
        Movement savedMovement = movementRepository.save(movement);

        log.info("Movement created successfully with ID: {}", savedMovement.getId());

        // Publish event
        MovementCreatedEvent event = new MovementCreatedEvent(
                savedMovement.getId(),
                savedMovement.getType(),
                savedMovement.getWarehouseId(),
                savedMovement.getSourceLocationId(),
                savedMovement.getDestinationLocationId(),
                savedMovement.getReferenceNumber(),
                savedMovement.getLines().size(),
                userId
        );
        kafkaEventPublisher.publishMovementCreatedEvent(event);

        return movementMapper.toResponseDto(savedMovement);
    }

    @Override
    @Transactional(readOnly = true)
    public MovementResponseDto getMovementById(UUID id) {
        log.info("Fetching movement with ID: {}", id);
    
        // First fetch with lines
        Movement movement = movementRepository.findByIdWithLines(id)
                .orElseThrow(() -> new MovementNotFoundException(id));
    
        // Then fetch with tasks (Hibernate will merge into the same entity)
        movementRepository.findByIdWithTasks(id);
    
        return movementMapper.toResponseDto(movement);
    }

    @Override
    @Transactional(readOnly = true)
    public MovementResponseDto getMovementByReferenceNumber(String referenceNumber) {
        log.info("Fetching movement with reference number: {}", referenceNumber);

        Movement movement = movementRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new MovementNotFoundException(referenceNumber));

        return movementMapper.toResponseDto(movement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> getAllMovements(Pageable pageable) {
        log.info("Fetching all movements with pagination");

        return movementRepository.findAll(pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> getMovementsByWarehouse(UUID warehouseId, Pageable pageable) {
        log.info("Fetching movements for warehouse: {}", warehouseId);

        return movementRepository.findByWarehouseId(warehouseId, pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> getMovementsByStatus(MovementStatus status, Pageable pageable) {
        log.info("Fetching movements with status: {}", status);

        return movementRepository.findByStatus(status, pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> getMovementsByType(MovementType type, Pageable pageable) {
        log.info("Fetching movements with type: {}", type);

        return movementRepository.findByType(type, pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> getMovementsByWarehouseAndStatus(UUID warehouseId, MovementStatus status, Pageable pageable) {
        log.info("Fetching movements for warehouse: {} with status: {}", warehouseId, status);

        return movementRepository.findByWarehouseIdAndStatus(warehouseId, status, pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> getMovementsByCreatedBy(UUID userId, Pageable pageable) {
        log.info("Fetching movements created by user: {}", userId);

        return movementRepository.findByCreatedBy(userId, pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> searchMovements(String searchTerm, Pageable pageable) {
        log.info("Searching movements with term: {}", searchTerm);

        return movementRepository.searchMovements(searchTerm, pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovementSummaryDto> advancedSearch(UUID warehouseId, MovementType type, MovementStatus status,
                                                   LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Advanced search - Warehouse: {}, Type: {}, Status: {}", warehouseId, type, status);

        return movementRepository.advancedSearch(warehouseId, type, status, startDate, endDate, pageable)
                .map(movementMapper::toSummaryDto);
    }

    @Override
    public MovementResponseDto updateMovement(UUID id, MovementUpdateRequestDto requestDto, UUID userId) {
        log.info("Updating movement: {} by user: {}", id, userId);

        Movement movement = movementRepository.findByIdWithLines(id)
                .orElseThrow(() -> new MovementNotFoundException(id));

        // Validate state transition
        MovementStatus oldStatus = movement.getStatus();

        // 🔥 VALIDATE QUANTITIES if transitioning to PENDING or IN_PROGRESS
        if (requestDto.getStatus() != null && 
            (requestDto.getStatus() == MovementStatus.PENDING || 
             requestDto.getStatus() == MovementStatus.IN_PROGRESS)) {
            
            log.info("🔍 Validating quantities before status change from {} to {}", 
                    oldStatus, requestDto.getStatus());
            
            String sourceLocationId = movement.getSourceLocationId() != null ? 
                                     movement.getSourceLocationId().toString() : null;
            
            quantityValidationService.validateExistingMovementLines(
                movement.getLines(), 
                sourceLocationId, 
                movement.getType()
            );
        }

        // Update fields
        if (requestDto.getStatus() != null) {
            validationService.validateStatusTransition(oldStatus, requestDto.getStatus());
            movement.setStatus(requestDto.getStatus());
        }

        if (requestDto.getPriority() != null) {
            movement.setPriority(requestDto.getPriority());
        }

        if (requestDto.getExpectedDate() != null) {
            movement.setExpectedDate(requestDto.getExpectedDate());
        }

        if (requestDto.getActualDate() != null) {
            movement.setActualDate(requestDto.getActualDate());
        }

        if (requestDto.getScheduledDate() != null) {
            movement.setScheduledDate(requestDto.getScheduledDate());
        }

        if (requestDto.getSourceLocationId() != null) {
            movement.setSourceLocationId(requestDto.getSourceLocationId());
        }

        if (requestDto.getDestinationLocationId() != null) {
            movement.setDestinationLocationId(requestDto.getDestinationLocationId());
        }

        if (requestDto.getSourceUserId() != null) {
            movement.setSourceUserId(requestDto.getSourceUserId());
        }

        if (requestDto.getDestinationUserId() != null) {
            movement.setDestinationUserId(requestDto.getDestinationUserId());
        }

        if (requestDto.getReferenceNumber() != null) {
            movement.setReferenceNumber(requestDto.getReferenceNumber());
        }

        if (requestDto.getNotes() != null) {
            movement.setNotes(requestDto.getNotes());
        }

        if (requestDto.getReason() != null) {
            movement.setReason(requestDto.getReason());
        }

        Movement updatedMovement = movementRepository.save(movement);

        // Publish status change event if status changed
        if (requestDto.getStatus() != null && !oldStatus.equals(requestDto.getStatus())) {
            MovementStatusChangedEvent event = new MovementStatusChangedEvent(
                    movement.getId(),
                    oldStatus,
                    movement.getStatus(),
                    movement.getWarehouseId(),
                    movement.getReferenceNumber(),
                    requestDto.getReason(),
                    userId
            );
            kafkaEventPublisher.publishMovementStatusChangedEvent(event);
        }

        log.info("Movement updated successfully: {}", id);

        return movementMapper.toResponseDto(updatedMovement);
    }

    @Override
    public void deleteMovement(UUID id, UUID userId) {
        log.info("Deleting movement: {} by user: {}", id, userId);

        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new MovementNotFoundException(id));

        // Only allow deletion of DRAFT or CANCELLED movements
        if (movement.getStatus() != MovementStatus.DRAFT &&
                movement.getStatus() != MovementStatus.CANCELLED) {
            throw new InvalidMovementStateException(id, movement.getStatus(), "delete");
        }

        movementRepository.delete(movement);

        log.info("Movement deleted successfully: {}", id);
    }

    @Override
    public MovementResponseDto startMovement(UUID id, UUID userId) {
        log.info("Starting movement: {} by user: {}", id, userId);

        Movement movement = movementRepository.findByIdWithLines(id)
                .orElseThrow(() -> new MovementNotFoundException(id));

        // Validate state transition
        if (movement.getStatus() != MovementStatus.PENDING &&
                movement.getStatus() != MovementStatus.DRAFT) {
            throw new InvalidMovementStateException(id, movement.getStatus(), "start");
        }

        // 🔥 VALIDATE QUANTITIES before starting
        log.info("🔍 Validating quantities before starting movement");
        String sourceLocationId = movement.getSourceLocationId() != null ? 
                                 movement.getSourceLocationId().toString() : null;
        
        quantityValidationService.validateExistingMovementLines(
            movement.getLines(), 
            sourceLocationId, 
            movement.getType()
        );

        MovementStatus oldStatus = movement.getStatus();
        movement.setStatus(MovementStatus.IN_PROGRESS);

        Movement updatedMovement = movementRepository.save(movement);

        // Publish status change event
        MovementStatusChangedEvent event = new MovementStatusChangedEvent(
                movement.getId(),
                oldStatus,
                MovementStatus.IN_PROGRESS,
                movement.getWarehouseId(),
                movement.getReferenceNumber(),
                "Movement started",
                userId
        );
        kafkaEventPublisher.publishMovementStatusChangedEvent(event);

        log.info("Movement started successfully: {}", id);

        return movementMapper.toResponseDto(updatedMovement);
    }

    @Override
    public MovementResponseDto completeMovement(UUID id, UUID userId) {
        log.info("Completing movement: {} by user: {}", id, userId);

        Movement movement = movementRepository.findByIdWithLines(id)
                .orElseThrow(() -> new MovementNotFoundException(id));

        if (movement.getStatus() != MovementStatus.IN_PROGRESS &&
                movement.getStatus() != MovementStatus.PARTIALLY_COMPLETED) {
            throw new InvalidMovementStateException(id, movement.getStatus(), "complete");
        }

        MovementStatus oldStatus = movement.getStatus();
        movement.setStatus(MovementStatus.COMPLETED);
        movement.setActualDate(LocalDateTime.now());
        movement.setCompletedBy(userId);
        movement.setCompletedAt(LocalDateTime.now());

        Movement updatedMovement = movementRepository.save(movement);

        // 🔥 BUILD LINE DATA
        List<MovementCompletedEvent.MovementLineData> lineData = movement.getLines().stream()
                .map(line -> new MovementCompletedEvent.MovementLineData(
                        line.getId(),
                        line.getItemId(),
                        line.getRequestedQuantity(),
                        line.getActualQuantity(),
                        line.getUom(),
                        line.getLotId(),
                        line.getSerialId(),
                        line.getFromLocationId(),
                        line.getToLocationId()
                ))
                .collect(Collectors.toList());

        long completedLines = movement.getLines().stream()
                .filter(line -> line.getStatus() == LineStatus.COMPLETED)
                .count();

        // ✅ CREATE EVENT WITH LINES
        MovementCompletedEvent event = new MovementCompletedEvent(
                movement.getId(),
                movement.getType().name(),
                movement.getWarehouseId(),
                movement.getSourceLocationId(),
                movement.getDestinationLocationId(),
                movement.getReferenceNumber(),
                LocalDateTime.now(),
                movement.getLines().size(),
                (int) completedLines,
                lineData,  // 🔥 INCLUDE LINES!
                userId
        );
        
        // ✅ PUBLISH TO KAFKA (inventory will be updated automatically)
        kafkaEventPublisher.publishMovementCompletedEvent(event);

        log.info("✅ Movement completed successfully: {} - Inventory will be updated automatically via Kafka", id);

        return movementMapper.toResponseDto(updatedMovement);
    } 

    @Override
    public MovementResponseDto cancelMovement(UUID id, String reason, UUID userId) {
        log.info("Cancelling movement: {} by user: {}", id, userId);

        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new MovementNotFoundException(id));

        // Cannot cancel completed movements
        if (movement.getStatus() == MovementStatus.COMPLETED) {
            throw new InvalidMovementStateException(id, movement.getStatus(), "cancel");
        }

        MovementStatus oldStatus = movement.getStatus();
        movement.setStatus(MovementStatus.CANCELLED);
        movement.setReason(reason);

        Movement updatedMovement = movementRepository.save(movement);

        // Publish cancellation event
        MovementCancelledEvent event = new MovementCancelledEvent(
                movement.getId(),
                movement.getType(),
                movement.getWarehouseId(),
                movement.getReferenceNumber(),
                reason,
                userId
        );
        kafkaEventPublisher.publishMovementCancelledEvent(event);

        log.info("Movement cancelled successfully: {}", id);

        return movementMapper.toResponseDto(updatedMovement);
    }

    @Override
    public MovementResponseDto holdMovement(UUID id, String reason, UUID userId) {
        log.info("Putting movement on hold: {} by user: {}", id, userId);

        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new MovementNotFoundException(id));

        // Can only hold movements that are in progress or pending
        if (movement.getStatus() != MovementStatus.IN_PROGRESS &&
                movement.getStatus() != MovementStatus.PENDING) {
            throw new InvalidMovementStateException(id, movement.getStatus(), "hold");
        }

        MovementStatus oldStatus = movement.getStatus();
        movement.setStatus(MovementStatus.ON_HOLD);
        movement.setReason(reason);

        Movement updatedMovement = movementRepository.save(movement);

        // Publish status change event
        MovementStatusChangedEvent event = new MovementStatusChangedEvent(
                movement.getId(),
                oldStatus,
                MovementStatus.ON_HOLD,
                movement.getWarehouseId(),
                movement.getReferenceNumber(),
                reason,
                userId
        );
        kafkaEventPublisher.publishMovementStatusChangedEvent(event);

        log.info("Movement put on hold successfully: {}", id);

        return movementMapper.toResponseDto(updatedMovement);
    }

    @Override
    public MovementResponseDto releaseMovement(UUID id, UUID userId) {
        log.info("Releasing movement from hold: {} by user: {}", id, userId);

        Movement movement = movementRepository.findByIdWithLines(id)
                .orElseThrow(() -> new MovementNotFoundException(id));

        // Can only release movements that are on hold
        if (movement.getStatus() != MovementStatus.ON_HOLD) {
            throw new InvalidMovementStateException(id, movement.getStatus(), "release");
        }

        // 🔥 VALIDATE QUANTITIES before releasing from hold
        log.info("🔍 Validating quantities before releasing from hold");
        String sourceLocationId = movement.getSourceLocationId() != null ? 
                                 movement.getSourceLocationId().toString() : null;
        
        quantityValidationService.validateExistingMovementLines(
            movement.getLines(), 
            sourceLocationId, 
            movement.getType()
        );

        MovementStatus oldStatus = movement.getStatus();
        movement.setStatus(MovementStatus.PENDING);

        Movement updatedMovement = movementRepository.save(movement);

        // Publish status change event
        MovementStatusChangedEvent event = new MovementStatusChangedEvent(
                movement.getId(),
                oldStatus,
                MovementStatus.PENDING,
                movement.getWarehouseId(),
                movement.getReferenceNumber(),
                "Movement released from hold",
                userId
        );
        kafkaEventPublisher.publishMovementStatusChangedEvent(event);

        log.info("Movement released from hold successfully: {}", id);

        return movementMapper.toResponseDto(updatedMovement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovementSummaryDto> getOverdueMovements() {
        log.info("Fetching overdue movements");

        List<Movement> overdueMovements = movementRepository.findOverdueMovements(LocalDateTime.now());

        return overdueMovements.stream()
                .map(movementMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> getMovementStatisticsByWarehouse(UUID warehouseId) {
        log.info("Fetching movement statistics for warehouse: {}", warehouseId);

        return movementRepository.getMovementStatisticsByWarehouse(warehouseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> getMovementStatisticsByType(UUID warehouseId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching movement statistics by type for warehouse: {}", warehouseId);

        return movementRepository.getMovementStatisticsByType(warehouseId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public long countPendingMovementsByWarehouse(UUID warehouseId) {
        log.info("Counting pending movements for warehouse: {}", warehouseId);

        return movementRepository.countPendingMovementsByWarehouse(warehouseId);
    }
}
