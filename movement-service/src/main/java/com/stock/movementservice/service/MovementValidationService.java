package com.stock.movementservice.service;

import com.stock.movementservice.dto.request.MovementRequestDto;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.exception.MovementValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class MovementValidationService {

    /**
     * Validate movement request
     */
    public void validateMovementRequest(MovementRequestDto requestDto) {
        List<String> errors = new ArrayList<>();

        // Validate warehouse ID
        if (requestDto.getWarehouseId() == null) {
            errors.add("Warehouse ID is required");
        }

        // Validate movement type
        if (requestDto.getType() == null) {
            errors.add("Movement type is required");
        }

        // Validate lines
        if (requestDto.getLines() == null || requestDto.getLines().isEmpty()) {
            errors.add("At least one movement line is required");
        } else {
            // Validate each line
            for (int i = 0; i < requestDto.getLines().size(); i++) {
                var line = requestDto.getLines().get(i);

                if (line.getItemId() == null) {
                    errors.add("Line " + (i + 1) + ": Item ID is required");
                }

                if (line.getRequestedQuantity() == null || line.getRequestedQuantity() <= 0) {
                    errors.add("Line " + (i + 1) + ": Requested quantity must be greater than 0");
                }

                if (line.getLineNumber() == null) {
                    errors.add("Line " + (i + 1) + ": Line number is required");
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new MovementValidationException("Movement validation failed", errors);
        }
    }

    /**
     * Validate status transition
     */
    public void validateStatusTransition(MovementStatus currentStatus, MovementStatus newStatus) {
        log.debug("Validating status transition from {} to {}", currentStatus, newStatus);

        boolean isValid = switch (currentStatus) {
            case DRAFT -> newStatus == MovementStatus.PENDING ||
                    newStatus == MovementStatus.CANCELLED;

            case PENDING -> newStatus == MovementStatus.IN_PROGRESS ||
                    newStatus == MovementStatus.ON_HOLD ||
                    newStatus == MovementStatus.CANCELLED;

            case IN_PROGRESS -> newStatus == MovementStatus.COMPLETED ||
                    newStatus == MovementStatus.PARTIALLY_COMPLETED ||
                    newStatus == MovementStatus.ON_HOLD ||
                    newStatus == MovementStatus.CANCELLED;

            case PARTIALLY_COMPLETED -> newStatus == MovementStatus.COMPLETED ||
                    newStatus == MovementStatus.IN_PROGRESS ||
                    newStatus == MovementStatus.CANCELLED;

            case ON_HOLD -> newStatus == MovementStatus.PENDING ||
                    newStatus == MovementStatus.IN_PROGRESS ||
                    newStatus == MovementStatus.CANCELLED;

            case COMPLETED -> false; // Cannot transition from COMPLETED

            case CANCELLED -> false; // Cannot transition from CANCELLED
        };

        if (!isValid) {
            throw new MovementValidationException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus
            );
        }
    }
}
