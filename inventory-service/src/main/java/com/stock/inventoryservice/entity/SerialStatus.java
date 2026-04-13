package com.stock.inventoryservice.entity;

public enum SerialStatus {
    IN_STOCK,       // Available in warehouse
    SOLD,           // Sold to customer
    DEFECTIVE,      // Marked as defective
    RETURNING,      // In return process
    SCRAPPED        // Disposed/scrapped
}