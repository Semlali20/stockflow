package com.stock.qualityservice.entity;

public enum SamplingType {
    ZERO,          // 100% inspection
    SINGLE,        // One sample
    DOUBLE,        // Two-stage sampling
    MULTIPLE,      // Multi-stage sampling
    SEQUENTIAL     // Continuous evaluation
}