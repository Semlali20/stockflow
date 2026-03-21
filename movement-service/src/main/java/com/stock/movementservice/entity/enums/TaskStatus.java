package com.stock.movementservice.entity.enums;

public enum TaskStatus {
    PENDING,           // Not yet assigned
    ASSIGNED,          // Assigned to worker
    IN_PROGRESS,       // Worker started task
    COMPLETED,         // Task finished
    CANCELLED,         // Task cancelled
    FAILED             // Task failed/rejected
}
