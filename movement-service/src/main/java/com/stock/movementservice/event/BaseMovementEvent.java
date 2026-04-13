package com.stock.movementservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseMovementEvent {
    private UUID eventId;
    private LocalDateTime timestamp;
    private String eventType;
    private UUID userId; // Who triggered the event

    public BaseMovementEvent(String eventType, UUID userId) {
        this.eventId = UUID.randomUUID();
        this.timestamp = LocalDateTime.now();
        this.eventType = eventType;
        this.userId = userId;
    }
}
