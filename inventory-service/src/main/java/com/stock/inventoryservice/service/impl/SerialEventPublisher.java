package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.event.dto.SerialEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SerialEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String SERIAL_CREATED_TOPIC = "serial.created";
    private static final String SERIAL_UPDATED_TOPIC = "serial.updated";
    private static final String SERIAL_DELETED_TOPIC = "serial.deleted";
    private static final String SERIAL_STATUS_CHANGED_TOPIC = "serial.status.changed";
    private static final String SERIAL_LOCATION_CHANGED_TOPIC = "serial.location.changed";

    /**
     * Publish serial event based on event type
     */
    public void publishSerialEvent(SerialEvent event) {
        String topic = getTopicByEventType(event.getEventType());

        log.info("Publishing serial event: {} to topic: {}", event.getEventType(), topic);

        try {
            kafkaTemplate.send(topic, event.getSerialId(), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("Successfully published serial event: {} for serial: {}",
                                    event.getEventType(), event.getSerialId());
                        } else {
                            log.error("Failed to publish serial event: {} for serial: {}",
                                    event.getEventType(), event.getSerialId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("Error publishing serial event: {}", event.getEventType(), e);
        }
    }

    /**
     * Get Kafka topic based on event type
     */
    private String getTopicByEventType(String eventType) {
        return switch (eventType.toUpperCase()) {
            case "CREATED" -> SERIAL_CREATED_TOPIC;
            case "UPDATED" -> SERIAL_UPDATED_TOPIC;
            case "DELETED" -> SERIAL_DELETED_TOPIC;
            case "STATUS_CHANGED" -> SERIAL_STATUS_CHANGED_TOPIC;
            case "LOCATION_CHANGED" -> SERIAL_LOCATION_CHANGED_TOPIC;
            default -> SERIAL_UPDATED_TOPIC;
        };
    }
}
