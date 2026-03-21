package com.stock.movementservice.entity.enums;

public enum MovementType {
    RECEIPT,           // Receiving goods into warehouse
    ISSUE,             // Issuing goods out of warehouse
    TRANSFER,          // Moving between locations
    ADJUSTMENT,        // Inventory correction
    PICKING,           // Order picking
    PUTAWAY,           // Storing received goods
    RETURN,            // Customer/supplier returns
    CYCLE_COUNT,       // Physical count movements
    QUARANTINE,        // Moving to/from quarantine
    RELOCATION         // Internal reorganization
}
