package com.stock.movementservice.entity.enums;

public enum LineStatus {
    PENDING,           // Not started
    ALLOCATED,         // Inventory reserved
    PICKED,            // Items picked from location
    PACKED,            // Items packed for movement
    IN_TRANSIT,        // Being moved
    RECEIVED,          // Received at destination
    COMPLETED,         // Fully processed
    CANCELLED,         // Line cancelled
    SHORT_PICKED       // Partially picked (less than requested)
}
