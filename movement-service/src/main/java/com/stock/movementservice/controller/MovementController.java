package com.stock.movementservice.controller;

import com.stock.movementservice.dto.request.MovementRequestDto;
import com.stock.movementservice.dto.request.MovementUpdateRequestDto;
import com.stock.movementservice.dto.response.MovementResponseDto;
import com.stock.movementservice.dto.response.MovementSummaryDto;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
import com.stock.movementservice.service.MovementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movement Management", description = "APIs for managing stock movements")
public class MovementController {

    private final MovementService movementService;

    /**
     * Create a new movement
     */
    @PostMapping
    @Operation(summary = "Create a new movement", description = "Creates a new stock movement with lines and optional tasks")
    public ResponseEntity<MovementResponseDto> createMovement(
            @Valid @RequestBody MovementRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to create movement by user: {}", userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementResponseDto response = movementService.createMovement(requestDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get movement by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get movement by ID", description = "Retrieves a movement with all its lines and tasks")
    public ResponseEntity<MovementResponseDto> getMovementById(
            @Parameter(description = "Movement ID") @PathVariable UUID id) {

        log.info("REST request to get movement: {}", id);

        MovementResponseDto response = movementService.getMovementById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get movement by reference number
     */
    @GetMapping("/reference/{referenceNumber}")
    @Operation(summary = "Get movement by reference number", description = "Retrieves a movement by its reference number")
    public ResponseEntity<MovementResponseDto> getMovementByReferenceNumber(
            @Parameter(description = "Reference number") @PathVariable String referenceNumber) {

        log.info("REST request to get movement by reference: {}", referenceNumber);

        MovementResponseDto response = movementService.getMovementByReferenceNumber(referenceNumber);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all movements with pagination
     */
    @GetMapping
    @Operation(summary = "Get all movements", description = "Retrieves all movements with pagination and sorting")
    public ResponseEntity<Page<MovementSummaryDto>> getAllMovements(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to get all movements with pagination");

        Page<MovementSummaryDto> response = movementService.getAllMovements(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get movements by warehouse
     */
    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get movements by warehouse", description = "Retrieves all movements for a specific warehouse")
    public ResponseEntity<Page<MovementSummaryDto>> getMovementsByWarehouse(
            @Parameter(description = "Warehouse ID") @PathVariable UUID warehouseId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to get movements for warehouse: {}", warehouseId);

        Page<MovementSummaryDto> response = movementService.getMovementsByWarehouse(warehouseId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get movements by status
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "Get movements by status", description = "Retrieves all movements with a specific status")
    public ResponseEntity<Page<MovementSummaryDto>> getMovementsByStatus(
            @Parameter(description = "Movement status") @PathVariable MovementStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to get movements with status: {}", status);

        Page<MovementSummaryDto> response = movementService.getMovementsByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get movements by type
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "Get movements by type", description = "Retrieves all movements of a specific type")
    public ResponseEntity<Page<MovementSummaryDto>> getMovementsByType(
            @Parameter(description = "Movement type") @PathVariable MovementType type,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to get movements with type: {}", type);

        Page<MovementSummaryDto> response = movementService.getMovementsByType(type, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get movements by warehouse and status
     */
    @GetMapping("/warehouse/{warehouseId}/status/{status}")
    @Operation(summary = "Get movements by warehouse and status",
            description = "Retrieves movements filtered by both warehouse and status")
    public ResponseEntity<Page<MovementSummaryDto>> getMovementsByWarehouseAndStatus(
            @Parameter(description = "Warehouse ID") @PathVariable UUID warehouseId,
            @Parameter(description = "Movement status") @PathVariable MovementStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to get movements for warehouse: {} with status: {}", warehouseId, status);

        Page<MovementSummaryDto> response = movementService.getMovementsByWarehouseAndStatus(warehouseId, status, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get movements created by user
     */
    @GetMapping("/created-by/{userId}")
    @Operation(summary = "Get movements created by user", description = "Retrieves all movements created by a specific user")
    public ResponseEntity<Page<MovementSummaryDto>> getMovementsByCreatedBy(
            @Parameter(description = "User ID") @PathVariable UUID userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to get movements created by user: {}", userId);

        Page<MovementSummaryDto> response = movementService.getMovementsByCreatedBy(userId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Search movements
     */
    @GetMapping("/search")
    @Operation(summary = "Search movements", description = "Search movements by reference number or notes")
    public ResponseEntity<Page<MovementSummaryDto>> searchMovements(
            @Parameter(description = "Search term") @RequestParam String searchTerm,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to search movements with term: {}", searchTerm);

        Page<MovementSummaryDto> response = movementService.searchMovements(searchTerm, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Advanced search
     */
    @GetMapping("/advanced-search")
    @Operation(summary = "Advanced search", description = "Search movements with multiple filters")
    public ResponseEntity<Page<MovementSummaryDto>> advancedSearch(
            @Parameter(description = "Warehouse ID") @RequestParam(required = false) UUID warehouseId,
            @Parameter(description = "Movement type") @RequestParam(required = false) MovementType type,
            @Parameter(description = "Movement status") @RequestParam(required = false) MovementStatus status,
            @Parameter(description = "Start date") @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date") @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request for advanced search - Warehouse: {}, Type: {}, Status: {}",
                warehouseId, type, status);

        Page<MovementSummaryDto> response = movementService.advancedSearch(
                warehouseId, type, status, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Update movement
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update movement", description = "Updates an existing movement")
    public ResponseEntity<MovementResponseDto> updateMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID id,
            @Valid @RequestBody MovementUpdateRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to update movement: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementResponseDto response = movementService.updateMovement(id, requestDto, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete movement
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete movement", description = "Deletes a movement (only DRAFT or CANCELLED)")
    public ResponseEntity<Void> deleteMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to delete movement: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        movementService.deleteMovement(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Start movement
     */
    @PostMapping("/{id}/start")
    @Operation(summary = "Start movement", description = "Changes movement status to IN_PROGRESS")
    public ResponseEntity<MovementResponseDto> startMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to start movement: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementResponseDto response = movementService.startMovement(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete movement
     */
    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete movement", description = "Changes movement status to COMPLETED")
    public ResponseEntity<MovementResponseDto> completeMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to complete movement: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementResponseDto response = movementService.completeMovement(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel movement
     */
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel movement", description = "Changes movement status to CANCELLED")
    public ResponseEntity<MovementResponseDto> cancelMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID id,
            @Parameter(description = "Cancellation reason") @RequestParam String reason,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to cancel movement: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementResponseDto response = movementService.cancelMovement(id, reason, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Hold movement
     */
    @PostMapping("/{id}/hold")
    @Operation(summary = "Hold movement", description = "Changes movement status to ON_HOLD")
    public ResponseEntity<MovementResponseDto> holdMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID id,
            @Parameter(description = "Hold reason") @RequestParam String reason,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to hold movement: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementResponseDto response = movementService.holdMovement(id, reason, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Release movement from hold
     */
    @PostMapping("/{id}/release")
    @Operation(summary = "Release movement", description = "Releases movement from ON_HOLD status")
    public ResponseEntity<MovementResponseDto> releaseMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to release movement: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementResponseDto response = movementService.releaseMovement(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get overdue movements
     */
    @GetMapping("/overdue")
    @Operation(summary = "Get overdue movements", description = "Retrieves all movements past their expected date")
    public ResponseEntity<List<MovementSummaryDto>> getOverdueMovements() {
        log.info("REST request to get overdue movements");

        List<MovementSummaryDto> response = movementService.getOverdueMovements();
        return ResponseEntity.ok(response);
    }
}
