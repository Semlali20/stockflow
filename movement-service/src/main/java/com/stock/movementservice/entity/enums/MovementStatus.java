package com.stock.movementservice.entity.enums;

public enum MovementStatus {
    DRAFT,                  // Being created
    PENDING,                // Awaiting execution
    IN_PROGRESS,            // Currently being executed
    COMPLETED,              // Finished successfully
    CANCELLED,              // Cancelled before completion
    ON_HOLD,                // Temporarily paused
    PARTIALLY_COMPLETED     // Some lines done, others pending
}
