package com.stock.movementservice.service;

import com.stock.movementservice.dto.request.MovementRequestDto;
import com.stock.movementservice.dto.request.MovementUpdateRequestDto;
import com.stock.movementservice.dto.response.MovementResponseDto;
import com.stock.movementservice.dto.response.MovementSummaryDto;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MovementService {

    /**
     * Create a new movement
     */
    MovementResponseDto createMovement(MovementRequestDto requestDto, UUID userId);

    /**
     * Get movement by ID
     */
    MovementResponseDto getMovementById(UUID id);

    /**
     * Get movement by reference number
     */
    MovementResponseDto getMovementByReferenceNumber(String referenceNumber);

    /**
     * Get all movements with pagination
     */
    Page<MovementSummaryDto> getAllMovements(Pageable pageable);

    /**
     * Get movements by warehouse
     */
    Page<MovementSummaryDto> getMovementsByWarehouse(UUID warehouseId, Pageable pageable);

    /**
     * Get movements by status
     */
    Page<MovementSummaryDto> getMovementsByStatus(MovementStatus status, Pageable pageable);

    /**
     * Get movements by type
     */
    Page<MovementSummaryDto> getMovementsByType(MovementType type, Pageable pageable);

    /**
     * Get movements by warehouse and status
     */
    Page<MovementSummaryDto> getMovementsByWarehouseAndStatus(UUID warehouseId, MovementStatus status, Pageable pageable);

    /**
     * Get movements created by user
     */
    Page<MovementSummaryDto> getMovementsByCreatedBy(UUID userId, Pageable pageable);

    /**
     * Search movements
     */
    Page<MovementSummaryDto> searchMovements(String searchTerm, Pageable pageable);

    /**
     * Advanced search
     */
    Page<MovementSummaryDto> advancedSearch(UUID warehouseId, MovementType type, MovementStatus status,
                                            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Update movement
     */
    MovementResponseDto updateMovement(UUID id, MovementUpdateRequestDto requestDto, UUID userId);

    /**
     * Delete movement
     */
    void deleteMovement(UUID id, UUID userId);

    /**
     * Start movement (change status to IN_PROGRESS)
     */
    MovementResponseDto startMovement(UUID id, UUID userId);

    /**
     * Complete movement (change status to COMPLETED)
     */
    MovementResponseDto completeMovement(UUID id, UUID userId);

    /**
     * Cancel movement
     */
    MovementResponseDto cancelMovement(UUID id, String reason, UUID userId);

    /**
     * Put movement on hold
     */
    MovementResponseDto holdMovement(UUID id, String reason, UUID userId);

    /**
     * Release movement from hold
     */
    MovementResponseDto releaseMovement(UUID id, UUID userId);

    /**
     * Get overdue movements
     */
    List<MovementSummaryDto> getOverdueMovements();

    /**
     * Get movement statistics by warehouse
     */
    List<Object[]> getMovementStatisticsByWarehouse(UUID warehouseId);

    /**
     * Get movement statistics by type
     */
    List<Object[]> getMovementStatisticsByType(UUID warehouseId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Count pending movements by warehouse
     */
    long countPendingMovementsByWarehouse(UUID warehouseId);
}
