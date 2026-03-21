package com.stock.movementservice.event.consumer;

import com.stock.movementservice.event.dto.ItemEvent;
import com.stock.movementservice.service.cache.ItemCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Consumes item events to maintain item cache
 * Used for movement validation
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ItemEventConsumer {

    private final ItemCacheService itemCacheService;

    @KafkaListener(
        topics = "item.created",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleItemCreated(
        @Payload ItemEvent event,
        @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        log.info("📦 Received item.created: {} - {}", event.getId(), event.getSku());
        
        try {
            // Cache item for movement validation
            itemCacheService.cacheItem(event);
            log.info("✅ Item cached: {} (SKU: {})", event.getName(), event.getSku());
            
        } catch (Exception e) {
            log.error("❌ Error processing item.created: {}", event.getId(), e);
        }
    }

    @KafkaListener(
        topics = "item.updated",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleItemUpdated(
        @Payload ItemEvent event
    ) {
        log.info("📦 Received item.updated: {} - Active: {}", event.getId(), event.getIsActive());
        
        try {
            // Update cached item
            itemCacheService.cacheItem(event);
            
            // If item was deactivated, warn about pending movements
            if (!event.getIsActive()) {
                log.warn("⚠️ Item {} deactivated, check pending movements", event.getId());
                // TODO: Check for movements with this item and notify
            }
            
        } catch (Exception e) {
            log.error("❌ Error processing item.updated: {}", event.getId(), e);
        }
    }

    @KafkaListener(
        topics = "item.deleted",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleItemDeleted(
        @Payload ItemEvent event
    ) {
        log.info("🗑️ Received item.deleted: {}", event.getId());
        
        try {
            // Remove from cache
            itemCacheService.deleteItem(event.getId());
            
            // Block any new movements for this item
            log.warn("🚫 Item {} deleted, movements blocked", event.getId());
            // TODO: Cancel pending movements for this item
            
        } catch (Exception e) {
            log.error("❌ Error processing item.deleted: {}", event.getId(), e);
        }
    }
}