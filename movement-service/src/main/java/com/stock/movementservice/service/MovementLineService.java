package com.stock.movementservice.service;

import com.stock.movementservice.dto.request.MovementLineRequestDto;
import com.stock.movementservice.dto.response.MovementLineResponseDto;
import com.stock.movementservice.entity.enums.LineStatus;

import java.util.List;
import java.util.UUID;

public interface MovementLineService {

    /**
     * Get line by ID
     */
    MovementLineResponseDto getLineById(UUID id);

    /**
     * Get all lines for a movement
     */
    List<MovementLineResponseDto> getLinesByMovement(UUID movementId);

    /**
     * Get lines by item
     */
    List<MovementLineResponseDto> getLinesByItem(UUID itemId);

    /**
     * Get lines by status
     */
    List<MovementLineResponseDto> getLinesByStatus(LineStatus status);

    /**
     * Add line to movement
     */
    MovementLineResponseDto addLineToMovement(UUID movementId, MovementLineRequestDto requestDto, UUID userId);

    /**
     * Update line
     */
    MovementLineResponseDto updateLine(UUID id, MovementLineRequestDto requestDto, UUID userId);

    /**
     * Delete line
     */
    void deleteLine(UUID id, UUID userId);

    /**
     * Update line actual quantity
     */
    MovementLineResponseDto updateActualQuantity(UUID id, Double actualQuantity, UUID userId);

    /**
     * Complete line
     */
    MovementLineResponseDto completeLine(UUID id, UUID userId);

    /**
     * Get lines with variance
     */
    List<MovementLineResponseDto> getLinesWithVariance();

    /**
     * Get short picked lines
     */
    List<MovementLineResponseDto> getShortPickedLines();
}
