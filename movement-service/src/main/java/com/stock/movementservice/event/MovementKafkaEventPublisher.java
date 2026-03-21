package com.stock.movementservice.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * 🔥 REAL KAFKA EVENT PUBLISHER
 * Sends events to actual Kafka topics (not internal Spring events)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MovementKafkaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Kafka topic names
    private static final String MOVEMENT_CREATED_TOPIC = "movement.created";
    private static final String MOVEMENT_COMPLETED_TOPIC = "movement.completed";
    private static final String MOVEMENT_CANCELLED_TOPIC = "movement.cancelled";
    private static final String MOVEMENT_STATUS_CHANGED_TOPIC = "movement.status.changed";

    /**
     * Publish movement created event to Kafka
     */
    public void publishMovementCreatedEvent(MovementCreatedEvent event) {
        log.info("📤 Publishing movement.created to Kafka: {}", event.getMovementId());
        
        try {
            kafkaTemplate.send(MOVEMENT_CREATED_TOPIC, event.getMovementId().toString(), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("✅ Successfully published movement.created: {}", event.getMovementId());
                        } else {
                            log.error("❌ Failed to publish movement.created: {}", event.getMovementId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("❌ Error publishing movement.created", e);
        }
    }

    /**
     * 🔥 Publish movement completed event to Kafka
     */
    public void publishMovementCompletedEvent(MovementCompletedEvent event) {
        log.info("📤 Publishing movement.completed to Kafka: {}", event.getMovementId());
        
        try {
            kafkaTemplate.send(MOVEMENT_COMPLETED_TOPIC, event.getMovementId().toString(), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("✅ Successfully published movement.completed to Kafka offset: {}", 
                                    result.getRecordMetadata().offset());
                            log.info("Topic: {}, Partition: {}", 
                                    result.getRecordMetadata().topic(), 
                                    result.getRecordMetadata().partition());
                        } else {
                            log.error("❌ Failed to publish movement.completed: {}", event.getMovementId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("❌ Error publishing movement.completed", e);
        }
    }

    /**
     * Publish movement cancelled event to Kafka
     */
    public void publishMovementCancelledEvent(MovementCancelledEvent event) {
        log.info("📤 Publishing movement.cancelled to Kafka: {}", event.getMovementId());
        
        try {
            kafkaTemplate.send(MOVEMENT_CANCELLED_TOPIC, event.getMovementId().toString(), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("✅ Successfully published movement.cancelled: {}", event.getMovementId());
                        } else {
                            log.error("❌ Failed to publish movement.cancelled: {}", event.getMovementId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("❌ Error publishing movement.cancelled", e);
        }
    }

    /**
     * Publish movement status changed event to Kafka
     */
    public void publishMovementStatusChangedEvent(MovementStatusChangedEvent event) {
        log.info("📤 Publishing movement.status.changed to Kafka: {}", event.getMovementId());
        
        try {
            kafkaTemplate.send(MOVEMENT_STATUS_CHANGED_TOPIC, event.getMovementId().toString(), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("✅ Successfully published movement.status.changed: {}", event.getMovementId());
                        } else {
                            log.error("❌ Failed to publish movement.status.changed: {}", event.getMovementId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("❌ Error publishing movement.status.changed", e);
        }
    }
}