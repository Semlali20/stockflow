package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.event.dto.LotEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LotEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String LOT_CREATED_TOPIC = "lot.created";
    private static final String LOT_UPDATED_TOPIC = "lot.updated";
    private static final String LOT_DELETED_TOPIC = "lot.deleted";
    private static final String LOT_STATUS_CHANGED_TOPIC = "lot.status.changed";

    /**
     * Publish lot event based on event type
     */
    public void publishLotEvent(LotEvent event) {
        String topic = getTopicByEventType(event.getEventType());

        log.info("Publishing lot event: {} to topic: {}", event.getEventType(), topic);

        try {
            kafkaTemplate.send(topic, event.getLotId(), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("Successfully published lot event: {} for lot: {}",
                                    event.getEventType(), event.getLotId());
                        } else {
                            log.error("Failed to publish lot event: {} for lot: {}",
                                    event.getEventType(), event.getLotId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("Error publishing lot event: {}", event.getEventType(), e);
        }
    }

    /**
     * Get Kafka topic based on event type
     */
    private String getTopicByEventType(String eventType) {
        return switch (eventType.toUpperCase()) {
            case "CREATED" -> LOT_CREATED_TOPIC;
            case "UPDATED" -> LOT_UPDATED_TOPIC;
            case "DELETED" -> LOT_DELETED_TOPIC;
            case "STATUS_CHANGED" -> LOT_STATUS_CHANGED_TOPIC;
            default -> LOT_UPDATED_TOPIC;
        };
    }
}
