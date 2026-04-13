package com.stock.locationservice.event;

import com.stock.locationservice.config.KafkaConfig;
import com.stock.locationservice.dto.LocationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LocationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishLocationCreated(LocationDTO location) {
        log.info("Publishing location.created event for location: {}", location.getId());
        try {
            kafkaTemplate.send(KafkaConfig.LOCATION_CREATED_TOPIC, location.getId(), location);
            log.info("Successfully published location.created event");
        } catch (Exception e) {
            log.error("Failed to publish location.created event", e);
            // Consider adding to dead-letter queue or retry mechanism
        }
    }

    public void publishLocationUpdated(LocationDTO location) {
        log.info("Publishing location.updated event for location: {}", location.getId());
        try {
            kafkaTemplate.send(KafkaConfig.LOCATION_UPDATED_TOPIC, location.getId(), location);
            log.info("Successfully published location.updated event");
        } catch (Exception e) {
            log.error("Failed to publish location.updated event", e);
        }
    }

    public void publishLocationDeleted(String locationId) {
        log.info("Publishing location.deleted event for location: {}", locationId);
        try {
            kafkaTemplate.send(KafkaConfig.LOCATION_DELETED_TOPIC, locationId,
                    java.util.Map.of("locationId", locationId, "deletedAt", java.time.Instant.now()));
            log.info("Successfully published location.deleted event");
        } catch (Exception e) {
            log.error("Failed to publish location.deleted event", e);
        }
    }
}
