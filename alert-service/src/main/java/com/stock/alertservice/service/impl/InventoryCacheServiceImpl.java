package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.cache.InventorySnapshotDTO;
import com.stock.alertservice.service.InventoryCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryCacheServiceImpl implements InventoryCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String INVENTORY_CACHE_PREFIX = "alert:inventory:";
    private static final Duration CACHE_TTL = Duration.ofHours(12);

    @Override
    public void cacheInventory(InventorySnapshotDTO inventory) {
        log.debug("Caching inventory: {}", inventory.getInventoryId());

        String key = INVENTORY_CACHE_PREFIX + inventory.getInventoryId();
        redisTemplate.opsForValue().set(key, inventory, CACHE_TTL);

        log.debug("Inventory cached successfully: {}", inventory.getInventoryId());
    }

    @Override
    public Optional<InventorySnapshotDTO> getInventory(String inventoryId) {
        log.debug("Fetching inventory from cache: {}", inventoryId);

        String key = INVENTORY_CACHE_PREFIX + inventoryId;
        Object value = redisTemplate.opsForValue().get(key);

        if (value instanceof InventorySnapshotDTO) {
            log.debug("Inventory found in cache: {}", inventoryId);
            return Optional.of((InventorySnapshotDTO) value);
        }

        log.debug("Inventory not found in cache: {}", inventoryId);
        return Optional.empty();
    }

    @Override
    public void updateInventory(InventorySnapshotDTO inventory) {
        log.debug("Updating inventory in cache: {}", inventory.getInventoryId());
        cacheInventory(inventory);
    }

    @Override
    public void deleteInventory(String inventoryId) {
        log.debug("Deleting inventory from cache: {}", inventoryId);

        String key = INVENTORY_CACHE_PREFIX + inventoryId;
        redisTemplate.delete(key);

        log.debug("Inventory deleted from cache: {}", inventoryId);
    }

    @Override
    public boolean existsInCache(String inventoryId) {
        String key = INVENTORY_CACHE_PREFIX + inventoryId;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    @Override
    public void clearCache() {
        log.info("Clearing all inventory cache");

        var keys = redisTemplate.keys(INVENTORY_CACHE_PREFIX + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("Cleared {} inventory cache entries", keys.size());
        }
    }
}
