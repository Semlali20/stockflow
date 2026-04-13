package com.stock.movementservice.service;

import com.stock.movementservice.event.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EventPublisherService {

    private final ApplicationEventPublisher eventPublisher;

    public EventPublisherService(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    /**
     * Publish movement created event
     */
    public void publishMovementCreatedEvent(MovementCreatedEvent event) {
        log.info("Publishing MovementCreatedEvent for movement: {}", event.getMovementId());
        eventPublisher.publishEvent(event);
    }

    /**
     * Publish movement completed event
     */
    public void publishMovementCompletedEvent(MovementCompletedEvent event) {
        log.info("Publishing MovementCompletedEvent for movement: {}", event.getMovementId());
        eventPublisher.publishEvent(event);
    }

    /**
     * Publish movement cancelled event
     */
    public void publishMovementCancelledEvent(MovementCancelledEvent event) {
        log.info("Publishing MovementCancelledEvent for movement: {}", event.getMovementId());
        eventPublisher.publishEvent(event);
    }

    /**
     * Publish movement status changed event
     */
    public void publishMovementStatusChangedEvent(MovementStatusChangedEvent event) {
        log.info("Publishing MovementStatusChangedEvent for movement: {}", event.getMovementId());
        eventPublisher.publishEvent(event);
    }

    /**
     * Publish task assigned event
     */
    public void publishTaskAssignedEvent(TaskAssignedEvent event) {
        log.info("Publishing TaskAssignedEvent for task: {}", event.getTaskId());
        eventPublisher.publishEvent(event);
    }

    /**
     * Publish task completed event
     */
    public void publishTaskCompletedEvent(TaskCompletedEvent event) {
        log.info("Publishing TaskCompletedEvent for task: {}", event.getTaskId());
        eventPublisher.publishEvent(event);
    }

    /**
     * Publish inventory update event
     */
    public void publishInventoryUpdateEvent(InventoryUpdateEvent event) {
        log.info("Publishing InventoryUpdateEvent for movement: {}", event.getMovementId());
        eventPublisher.publishEvent(event);
    }
}
