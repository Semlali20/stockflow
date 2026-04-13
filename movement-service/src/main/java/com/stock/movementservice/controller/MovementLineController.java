package com.stock.movementservice.controller;

import com.stock.movementservice.dto.request.MovementLineRequestDto;
import com.stock.movementservice.dto.response.MovementLineResponseDto;
import com.stock.movementservice.entity.enums.LineStatus;
import com.stock.movementservice.service.MovementLineService;
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
@RequestMapping("/api/movement-lines")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movement Line Management", description = "APIs for managing movement lines")
public class MovementLineController {

    private final MovementLineService lineService;

    /**
     * Get line by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get line by ID", description = "Retrieves a movement line by its ID")
    public ResponseEntity<MovementLineResponseDto> getLineById(
            @Parameter(description = "Line ID") @PathVariable UUID id) {

        log.info("REST request to get movement line: {}", id);

        MovementLineResponseDto response = lineService.getLineById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get lines by movement
     */
    @GetMapping("/movement/{movementId}")
    @Operation(summary = "Get lines by movement", description = "Retrieves all lines for a specific movement")
    public ResponseEntity<List<MovementLineResponseDto>> getLinesByMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID movementId) {

        log.info("REST request to get lines for movement: {}", movementId);

        List<MovementLineResponseDto> response = lineService.getLinesByMovement(movementId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get lines by item
     */
    @GetMapping("/item/{itemId}")
    @Operation(summary = "Get lines by item", description = "Retrieves all lines for a specific item")
    public ResponseEntity<List<MovementLineResponseDto>> getLinesByItem(
            @Parameter(description = "Item ID") @PathVariable UUID itemId) {

        log.info("REST request to get lines for item: {}", itemId);

        List<MovementLineResponseDto> response = lineService.getLinesByItem(itemId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get lines by status
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "Get lines by status", description = "Retrieves all lines with a specific status")
    public ResponseEntity<List<MovementLineResponseDto>> getLinesByStatus(
            @Parameter(description = "Line status") @PathVariable LineStatus status) {

        log.info("REST request to get lines with status: {}", status);

        List<MovementLineResponseDto> response = lineService.getLinesByStatus(status);
        return ResponseEntity.ok(response);
    }

    /**
     * Add line to movement
     */
    @PostMapping("/movement/{movementId}")
    @Operation(summary = "Add line to movement", description = "Adds a new line to an existing movement")
    public ResponseEntity<MovementLineResponseDto> addLineToMovement(
            @Parameter(description = "Movement ID") @PathVariable UUID movementId,
            @Valid @RequestBody MovementLineRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to add line to movement: {} by user: {}", movementId, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementLineResponseDto response = lineService.addLineToMovement(movementId, requestDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update line
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update line", description = "Updates an existing movement line")
    public ResponseEntity<MovementLineResponseDto> updateLine(
            @Parameter(description = "Line ID") @PathVariable UUID id,
            @Valid @RequestBody MovementLineRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to update movement line: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementLineResponseDto response = lineService.updateLine(id, requestDto, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete line
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete line", description = "Deletes a movement line")
    public ResponseEntity<Void> deleteLine(
            @Parameter(description = "Line ID") @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to delete movement line: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        lineService.deleteLine(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update actual quantity
     */
    @PatchMapping("/{id}/actual-quantity")
    @Operation(summary = "Update actual quantity", description = "Updates the actual quantity for a line")
    public ResponseEntity<MovementLineResponseDto> updateActualQuantity(
            @Parameter(description = "Line ID") @PathVariable UUID id,
            @Parameter(description = "Actual quantity") @RequestParam Double actualQuantity,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to update actual quantity for line: {} to {} by user: {}",
                id, actualQuantity, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementLineResponseDto response = lineService.updateActualQuantity(id, actualQuantity, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete line
     */
    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete line", description = "Marks a line as completed")
    public ResponseEntity<MovementLineResponseDto> completeLine(
            @Parameter(description = "Line ID") @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        log.info("REST request to complete line: {} by user: {}", id, userId);

        if (userId == null) {
            userId = UUID.randomUUID(); // Default user for testing
        }

        MovementLineResponseDto response = lineService.completeLine(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get lines with variance
     */
    @GetMapping("/variance")
    @Operation(summary = "Get lines with variance",
            description = "Retrieves lines where actual quantity differs from requested quantity")
    public ResponseEntity<List<MovementLineResponseDto>> getLinesWithVariance() {
        log.info("REST request to get lines with variance");

        List<MovementLineResponseDto> response = lineService.getLinesWithVariance();
        return ResponseEntity.ok(response);
    }

    /**
     * Get short picked lines
     */
    @GetMapping("/short-picked")
    @Operation(summary = "Get short picked lines",
            description = "Retrieves lines where actual quantity is less than requested quantity")
    public ResponseEntity<List<MovementLineResponseDto>> getShortPickedLines() {
        log.info("REST request to get short picked lines");

        List<MovementLineResponseDto> response = lineService.getShortPickedLines();
        return ResponseEntity.ok(response);
    }
}
