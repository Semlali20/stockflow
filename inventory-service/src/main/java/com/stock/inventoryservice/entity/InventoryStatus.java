package com.stock.inventoryservice.entity;

public enum InventoryStatus {
    AVAILABLE,      // Normal, available for use
    RESERVED,       // Locked for orders/transfers
    ALLOCATED,      // Assigned to specific order
    DAMAGED,        // Damaged/defective
    QUARANTINED,    // Quality hold
    EXPIRED         // Past expiry date
}