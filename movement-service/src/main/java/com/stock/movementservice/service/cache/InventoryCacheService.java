package com.stock.movementservice.service.cache;

import com.stock.movementservice.event.dto.InventoryEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String INVENTORY_CACHE_PREFIX = "movement:inventory:";
    private static final long CACHE_TTL_MINUTES = 15; // Short TTL for real-time data

    public void cacheInventory(InventoryEvent inventory) {
        String key = INVENTORY_CACHE_PREFIX + inventory.getInventoryId();
        redisTemplate.opsForValue().set(key, inventory, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        log.debug("Cached inventory: {}", inventory.getInventoryId());
    }

    public Optional<InventoryEvent> getInventory(String inventoryId) {
        String key = INVENTORY_CACHE_PREFIX + inventoryId;
        InventoryEvent inventory = (InventoryEvent) redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(inventory);
    }

    public boolean hasAvailableStock(String itemId, String locationId, Double requiredQuantity) {
        // In production, query by item+location composite key
        // For now, simplified check
        String key = INVENTORY_CACHE_PREFIX + itemId + ":" + locationId;
        InventoryEvent inventory = (InventoryEvent) redisTemplate.opsForValue().get(key);
        
        if (inventory == null) {
            return false;
        }
        
        return inventory.getAvailableQuantity() >= requiredQuantity;
    }
}