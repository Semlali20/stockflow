package com.stock.movementservice.entity.enums;

public enum TaskType {
    PICK,              // Pick items from location
    PACK,              // Pack items
    PUT_AWAY,          // Store items in location
    COUNT,             // Count inventory
    INSPECT,           // Quality inspection
    LOAD,              // Load onto vehicle
    UNLOAD,            // Unload from vehicle
    STAGE,             // Stage for shipment
    REPLENISH          // Replenish pick location
}
