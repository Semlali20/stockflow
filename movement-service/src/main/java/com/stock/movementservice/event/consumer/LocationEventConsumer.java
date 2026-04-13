package com.stock.movementservice.event.consumer;

import com.stock.movementservice.event.dto.LocationEvent;
import com.stock.movementservice.service.cache.LocationCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Consumes location events to maintain location cache
 * Used for movement validation
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LocationEventConsumer {

    private final LocationCacheService locationCacheService;

    @KafkaListener(
        topics = "location.created",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleLocationCreated(
        @Payload LocationEvent event,
        @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        log.info("📍 Received location.created: {} - {}", event.getLocationId(), event.getCode());
        
        try {
            // Cache location for movement validation
            locationCacheService.cacheLocation(event);
            log.info("✅ Location cached: {}", event.getCode());
            
        } catch (Exception e) {
            log.error("❌ Error processing location.created: {}", event.getLocationId(), e);
        }
    }

    @KafkaListener(
        topics = "location.updated",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleLocationUpdated(
        @Payload LocationEvent event
    ) {
        log.info("📍 Received location.updated: {} - Active: {}", 
            event.getLocationId(), event.getIsActive());
        
        try {
            // Update cached location
            locationCacheService.cacheLocation(event);
            
            // If location was deactivated, warn about pending movements
            if (!event.getIsActive()) {
                log.warn("⚠️ Location {} deactivated, check pending movements", event.getLocationId());
                // TODO: Check for movements using this location and notify
            }
            
        } catch (Exception e) {
            log.error("❌ Error processing location.updated: {}", event.getLocationId(), e);
        }
    }

    @KafkaListener(
        topics = "location.deleted",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleLocationDeleted(
        @Payload LocationEvent event
    ) {
        log.info("🗑️ Received location.deleted: {}", event.getLocationId());
        
        try {
            // Remove from cache
            locationCacheService.deleteLocation(event.getLocationId());
            
            // Block any new movements to/from this location
            log.warn("🚫 Location {} deleted, movements blocked", event.getLocationId());
            // TODO: Cancel pending movements for this location
            
        } catch (Exception e) {
            log.error("❌ Error processing location.deleted: {}", event.getLocationId(), e);
        }
    }
}