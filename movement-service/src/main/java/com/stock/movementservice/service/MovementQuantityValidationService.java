package com.stock.movementservice.service;

import com.stock.movementservice.client.InventoryClient;
import com.stock.movementservice.dto.request.MovementLineRequestDto;
import com.stock.movementservice.dto.request.MovementRequestDto;
import com.stock.movementservice.entity.MovementLine;
import com.stock.movementservice.entity.enums.MovementType;
import com.stock.movementservice.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 🔥 Service to validate inventory quantities before movement execution
 * Ensures we don't move more stock than available at source location
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MovementQuantityValidationService {

    private final InventoryClient inventoryClient;

    /**
     * ✅ Validate quantities for movement creation
     * Called when status changes to PENDING or IN_PROGRESS
     */
    public void validateMovementQuantities(MovementRequestDto request) {
        log.info("🔍 Validating quantities for movement type: {}", request.getType());

        MovementType type = request.getType();

        // Only validate for movements that REDUCE inventory
        if (requiresQuantityValidation(type)) {
            List<String> errors = new ArrayList<>();

            for (MovementLineRequestDto line : request.getLines()) {
                String locationId = determineSourceLocation(request, line, type);

                if (locationId == null) {
                    errors.add("Line " + line.getLineNumber() + ": Source location is required for " + type);
                    continue;
                }

                Double requestedQty = line.getRequestedQuantity();
                String itemId = line.getItemId() != null ? line.getItemId().toString() : null;

                if (itemId == null) {
                    errors.add("Line " + line.getLineNumber() + ": Item ID is required");
                    continue;
                }

                // Check available quantity at source location
                try {
                    Double availableQty = inventoryClient.getAvailableQuantity(itemId, locationId);

                    log.debug("Item: {}, Location: {}, Available: {}, Requested: {}",
                            itemId, locationId, availableQty, requestedQty);

                    if (availableQty < requestedQty) {
                        errors.add(String.format(
                                "Line %d: Insufficient stock for item %s at location %s. Available: %.2f, Requested: %.2f",
                                line.getLineNumber(), itemId, locationId, availableQty, requestedQty
                        ));
                    }
                } catch (Exception e) {
                    log.error("Error checking availability for item {} at location {}", itemId, locationId, e);
                    errors.add("Line " + line.getLineNumber() + ": Unable to verify stock availability - " + e.getMessage());
                }
            }

            if (!errors.isEmpty()) {
                String errorMessage = "Movement validation failed:\n" + String.join("\n", errors);
                log.error("❌ {}", errorMessage);
                throw new InsufficientStockException(errorMessage, errors);
            }
        }

        log.info("✅ All quantities validated successfully");
    }

    /**
     * ✅ Validate quantities for existing movement lines (when updating status)
     */
    public void validateExistingMovementLines(List<MovementLine> lines,
                                              String sourceLocationId,
                                              MovementType type) {
        log.info("🔍 Validating quantities for {} existing lines", lines.size());

        if (!requiresQuantityValidation(type)) {
            log.debug("Skipping validation for movement type: {}", type);
            return;
        }

        List<String> errors = new ArrayList<>();

        for (MovementLine line : lines) {
            // Get location ID - prefer line's fromLocationId, fallback to movement's sourceLocationId
            String locationId = null;
            if (line.getFromLocationId() != null) {
                locationId = line.getFromLocationId().toString();
            } else if (sourceLocationId != null) {
                locationId = sourceLocationId;
            }

            if (locationId == null) {
                errors.add("Line " + line.getLineNumber() + ": Source location is required");
                continue;
            }

            Double requestedQty = line.getRequestedQuantity();
            String itemId = line.getItemId() != null ? line.getItemId().toString() : null;

            if (itemId == null) {
                errors.add("Line " + line.getLineNumber() + ": Item ID is required");
                continue;
            }

            try {
                Double availableQty = inventoryClient.getAvailableQuantity(itemId, locationId);

                log.debug("Item: {}, Location: {}, Available: {}, Requested: {}",
                        itemId, locationId, availableQty, requestedQty);

                if (availableQty < requestedQty) {
                    errors.add(String.format(
                            "Line %d: Insufficient stock for item %s. Available: %.2f, Requested: %.2f",
                            line.getLineNumber(), itemId, availableQty, requestedQty
                    ));
                }
            } catch (Exception e) {
                log.error("Error checking availability for item {} at location {}", itemId, locationId, e);
                errors.add("Line " + line.getLineNumber() + ": Unable to verify stock - " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            String errorMessage = "Movement validation failed:\n" + String.join("\n", errors);
            log.error("❌ {}", errorMessage);
            throw new InsufficientStockException(errorMessage, errors);
        }

        log.info("✅ All existing lines validated successfully");
    }

    /**
     * 🔥 Determine if movement type requires quantity validation
     *
     * Movements that REDUCE inventory (require validation):
     * - ISSUE: Issuing goods out of warehouse
     * - TRANSFER: Moving between locations (reduces source)
     * - PICKING: Order picking (reduces available stock)
     * - RELOCATION: Internal reorganization (reduces source)
     *
     * Movements that INCREASE inventory (no validation needed):
     * - RECEIPT: Receiving goods into warehouse
     * - RETURN: Customer/supplier returns
     * - PUTAWAY: Storing received goods
     * - ADJUSTMENT: Inventory correction (can go up or down)
     * - CYCLE_COUNT: Physical count movements
     * - QUARANTINE: Moving to/from quarantine (special handling)
     */
    private boolean requiresQuantityValidation(MovementType type) {
        return switch (type) {
            // ✅ Validate - These movements REDUCE inventory at source
            case ISSUE, TRANSFER, PICKING, RELOCATION -> true;

            // ❌ Don't validate - These movements INCREASE or adjust inventory
            case RECEIPT, RETURN, PUTAWAY, ADJUSTMENT, CYCLE_COUNT, QUARANTINE -> false;
        };
    }

    /**
     * 🔥 Determine source location based on movement type
     * Returns String representation of location ID
     */
    private String determineSourceLocation(MovementRequestDto request,
                                           MovementLineRequestDto line,
                                           MovementType type) {
        // Check if this movement type needs source location validation
        if (!requiresQuantityValidation(type)) {
            return null;
        }

        // Priority 1: Try to get from line's fromLocationId (UUID)
        if (line.getFromLocationId() != null) {
            return line.getFromLocationId().toString();
        }

        // Priority 2: Try to get from movement request's sourceLocationId
        // This field could be String or UUID depending on your DTO definition
        if (request.getSourceLocationId() != null) {
            // Just call toString() - works for both String and UUID
            return request.getSourceLocationId().toString();
        }

        return null;
    }

    /**
     * 🔥 Validate single line quantity (for line-level operations)
     */
    public void validateLineQuantity(String itemId, String locationId, Double quantity) {
        log.info("🔍 Validating quantity for item {} at location {}: {}", itemId, locationId, quantity);

        try {
            Double availableQty = inventoryClient.getAvailableQuantity(itemId, locationId);

            if (availableQty < quantity) {
                String error = String.format(
                        "Insufficient stock. Available: %.2f, Requested: %.2f",
                        availableQty, quantity
                );
                log.error("❌ {}", error);
                throw new InsufficientStockException(error);
            }

            log.info("✅ Quantity validated successfully");
        } catch (InsufficientStockException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error checking availability", e);
            throw new RuntimeException("Unable to verify stock availability: " + e.getMessage());
        }
    }
}
