package com.stock.qualityservice.entity;

public enum QuarantineStatus {
    IN_PROCESS,      // Under inspection
    RELEASED,        // Released from quarantine
    REJECTED,        // Failed inspection
    QUARANTINED      // Held indefinitely
}