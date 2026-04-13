package com.stock.inventoryservice.service;


import com.stock.inventoryservice.dto.cache.ItemCacheDTO;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Set;

/**
 * Service for managing Item cache in Redis
 * Items are populated via Kafka events from Product Service
 * NO REST fallback - cache is the single source of truth
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ItemCacheService {

    private final RedisTemplate<String, ItemCacheDTO> redisTemplate;

    private static final String CACHE_PREFIX = "item:";
    private static final Duration CACHE_TTL = Duration.ofHours(24); // 24 hours TTL

    /**
     * Get Item from cache only
     * Throws exception if not found (item must be synced via Kafka)
     */
    public ItemCacheDTO getItem(String itemId) {
        log.debug("Getting item from cache: {}", itemId);
    
        String key = CACHE_PREFIX + itemId;
        ItemCacheDTO cachedItem = redisTemplate.opsForValue().get(key);
    
        if (cachedItem == null) {
            log.error("Item not found in cache: {}. Cache must be synced via Kafka events.", itemId);
            throw new ResourceNotFoundException("Item not found in cache: " + itemId);  // ❌ THIS IS THE PROBLEM
        }
    
        log.debug("Item found in cache: {}", itemId);
        return cachedItem;
    }
    /**
     * Get multiple items from cache
     */
    public List<ItemCacheDTO> getItems(List<String> itemIds) {
        log.debug("Getting {} items from cache", itemIds.size());

        List<String> keys = itemIds.stream()
                .map(id -> CACHE_PREFIX + id)
                .toList();

        List<ItemCacheDTO> items = redisTemplate.opsForValue().multiGet(keys);

        if (items == null) {
            return List.of();
        }

        return items.stream()
                .filter(item -> item != null)
                .toList();
    }

    /**
     * Cache an item with TTL
     * Called by Kafka event consumer
     */
    public void cacheItem(ItemCacheDTO item) {
        if (item == null || item.getId() == null) {
            log.warn("Attempted to cache null or invalid item");
            return;
        }

        String key = CACHE_PREFIX + item.getId();
        redisTemplate.opsForValue().set(key, item, CACHE_TTL);
        log.debug("Cached item: {} with TTL: {}", item.getId(), CACHE_TTL);
    }

    /**
     * Update cached item
     * Called by Kafka event consumer on item updates
     */
    public void updateItem(ItemCacheDTO item) {
        log.info("Updating cached item: {}", item.getId());
        cacheItem(item);
    }

    /**
     * Delete item from cache
     * Called by Kafka event consumer on item deletion
     */
    public void deleteItem(String itemId) {
        log.info("Deleting item from cache: {}", itemId);
        String key = CACHE_PREFIX + itemId;
        redisTemplate.delete(key);
    }

    /**
     * Check if item exists in cache
     */
    public boolean existsInCache(String itemId) {
        String key = CACHE_PREFIX + itemId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Warm up cache with items
     * Can be called on service startup or manually
     */
    public void warmUpCache(List<ItemCacheDTO> items) {
        log.info("Warming up cache with {} items", items.size());
        items.forEach(this::cacheItem);
    }

    /**
     * Clear all item cache
     */
    public void clearCache() {
        log.warn("Clearing entire item cache");
        String pattern = CACHE_PREFIX + "*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    /**
     * Get all cached items (for admin/debugging)
     */
    public List<ItemCacheDTO> getAllCachedItems() {
        log.debug("Fetching all cached items");
        String pattern = CACHE_PREFIX + "*";
        Set<String> keys = redisTemplate.keys(pattern);

        if (keys == null || keys.isEmpty()) {
            return List.of();
        }

        List<ItemCacheDTO> items = redisTemplate.opsForValue().multiGet(keys);
        return items != null ? items.stream().filter(item -> item != null).toList() : List.of();
    }

    /**
     * Get cache size
     */
    public long getCacheSize() {
        String pattern = CACHE_PREFIX + "*";
        Set<String> keys = redisTemplate.keys(pattern);
        return keys != null ? keys.size() : 0;
    }
}
