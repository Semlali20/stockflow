package com.stock.inventoryservice.event.consumer;

import com.stock.inventoryservice.dto.cache.ItemCacheDTO;
import com.stock.inventoryservice.event.dto.ItemEvent;
import com.stock.inventoryservice.service.ItemCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Kafka consumer that listens to Item events from Product Service
 * and updates the Redis cache accordingly
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ItemEventConsumer {

    private final ItemCacheService itemCacheService;

    /**
     * Listen to item.created topic
     * When a new item is created in Product Service, cache it
     */
    @KafkaListener(
            topics = "item.created",
            groupId = "inventory-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleItemCreated(
            @Payload ItemEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition
    ) {
        log.info("Received item.created event for item: {} from topic: {}, partition: {}",
                event.getId(), topic, partition);

        try {
            ItemCacheDTO cacheDTO = mapEventToCacheDTO(event);
            itemCacheService.cacheItem(cacheDTO);

            log.info("Successfully cached new item: {} in Redis", event.getId());
        } catch (Exception e) {
            log.error("Error processing item.created event for item: {}", event.getId(), e);
        }
    }

    /**
     * Listen to item.updated topic
     * When an item is updated in Product Service, update the cache
     */
    @KafkaListener(
            topics = "item.updated",
            groupId = "inventory-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleItemUpdated(
            @Payload ItemEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition
    ) {
        log.info("Received item.updated event for item: {} from topic: {}, partition: {}",
                event.getId(), topic, partition);

        try {
            ItemCacheDTO cacheDTO = mapEventToCacheDTO(event);
            itemCacheService.updateItem(cacheDTO);

            log.info("Successfully updated cached item: {} in Redis", event.getId());
        } catch (Exception e) {
            log.error("Error processing item.updated event for item: {}", event.getId(), e);
        }
    }

    /**
     * Listen to item.deleted topic
     * When an item is deleted in Product Service, remove from cache
     */
    @KafkaListener(
            topics = "item.deleted",
            groupId = "inventory-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleItemDeleted(
            @Payload ItemEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition
    ) {
        log.info("Received item.deleted event for item: {} from topic: {}, partition: {}",
                event.getId(), topic, partition);

        try {
            itemCacheService.deleteItem(event.getId());

            log.info("Successfully deleted cached item: {} from Redis", event.getId());
        } catch (Exception e) {
            log.error("Error processing item.deleted event for item: {}", event.getId(), e);
        }
    }

    /**
     * Listen to item.status.changed topic (when item is activated/deactivated)
     * Update the cache to reflect the status change
     */
    @KafkaListener(
            topics = "item.status.changed",
            groupId = "inventory-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleItemStatusChanged(
            @Payload ItemEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition
    ) {
        log.info("Received item.status.changed event for item: {} from topic: {}, partition: {}",
                event.getId(), topic, partition);

        try {
            ItemCacheDTO cacheDTO = mapEventToCacheDTO(event);
            itemCacheService.updateItem(cacheDTO);

            log.info("Successfully updated item status in cache: {}", event.getId());
        } catch (Exception e) {
            log.error("Error processing item.status.changed event for item: {}", event.getId(), e);
        }
    }

    /**
     * Map ItemEvent to ItemCacheDTO
     */
    private ItemCacheDTO mapEventToCacheDTO(ItemEvent event) {
        return ItemCacheDTO.builder()
                .id(event.getId())
                .sku(event.getSku())
                .name(event.getName())
                .categoryId(event.getCategoryId())
                .categoryName(null) // Will be enriched later if needed
                .isActive(event.getIsActive())

                .isSerialized(event.getIsSerialized())
                .isLotManaged(event.getIsLotManaged())
                .shelfLifeDays(event.getShelfLifeDays())
                .imageUrl(null) // Not in event
                .cachedAt(LocalDateTime.now())
                .build();
    }
}
