package com.stock.movementservice.event.consumer;

import com.stock.movementservice.event.dto.InventoryEvent;
import com.stock.movementservice.service.cache.InventoryCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Consumes inventory events to maintain real-time inventory cache
 * Used for movement validation and stock availability checks
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final InventoryCacheService inventoryCacheService;

    @KafkaListener(
        topics = "inventory.updated",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleInventoryUpdated(
        @Payload InventoryEvent event,
        @Header(KafkaHeaders.RECEIVED_KEY) String key,
        @Header(KafkaHeaders.RECEIVED_TOPIC) String topic
    ) {
        log.info("📦 Received inventory.updated: {} - Available: {}", 
            event.getInventoryId(), event.getAvailableQuantity());
        
        try {
            // Cache inventory for quick validation
            inventoryCacheService.cacheInventory(event);
            
            // Check if inventory is BLOCKED or QUARANTINED
            if ("BLOCKED".equals(event.getStatus()) || "QUARANTINED".equals(event.getStatus())) {
                log.warn("⚠️ Inventory {} is {}, movements should be blocked", 
                    event.getInventoryId(), event.getStatus());
                // TODO: Update any pending movements for this inventory
            }
            
        } catch (Exception e) {
            log.error("❌ Error processing inventory.updated: {}", event.getInventoryId(), e);
        }
    }

    @KafkaListener(
        topics = "inventory.reserved",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleInventoryReserved(
        @Payload InventoryEvent event
    ) {
        log.info("🔒 Received inventory.reserved: {} - Reserved: {}", 
            event.getInventoryId(), event.getReservedQuantity());
        
        try {
            // Update cache with new reserved quantity
            inventoryCacheService.cacheInventory(event);
            
        } catch (Exception e) {
            log.error("❌ Error processing inventory.reserved: {}", event.getInventoryId(), e);
        }
    }

    @KafkaListener(
        topics = "inventory.released",
        groupId = "movement-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleInventoryReleased(
        @Payload InventoryEvent event
    ) {
        log.info("🔓 Received inventory.released: {} - Available: {}", 
            event.getInventoryId(), event.getAvailableQuantity());
        
        try {
            // Update cache with released inventory
            inventoryCacheService.cacheInventory(event);
            
        } catch (Exception e) {
            log.error("❌ Error processing inventory.released: {}", event.getInventoryId(), e);
        }
    }
}