package com.stock.inventoryservice.entity;

public enum LotStatus {
    ACTIVE,         // Normal, in use
    QUARANTINED,    // Under quality inspection
    EXPIRED,        // Past expiry date
    RECALLED        // Product recall
}