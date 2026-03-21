package com.stock.qualityservice.entity;

public enum QCType {
    INCOMING,              // Receiving inspection
    IN_PROCESS,            // During operations
    FINAL_INSPECTION,      // Before shipment
    RANDOM_AUDIT,          // Spot check
    CUSTOMER_RETURN,       // Return inspection
    PROCESS_INSPECTION     // Mid-workflow check
}