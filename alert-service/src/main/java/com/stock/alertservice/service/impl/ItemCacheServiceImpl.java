package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.cache.ItemCacheDTO;
import com.stock.alertservice.service.ItemCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemCacheServiceImpl implements ItemCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String ITEM_CACHE_PREFIX = "alert:item:";
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    @Override
    public void cacheItem(ItemCacheDTO item) {
        log.debug("Caching item: {}", item.getId());

        String key = ITEM_CACHE_PREFIX + item.getId();
        redisTemplate.opsForValue().set(key, item, CACHE_TTL);

        log.debug("Item cached successfully: {}", item.getId());
    }

    @Override
    public Optional<ItemCacheDTO> getItem(String itemId) {
        log.debug("Fetching item from cache: {}", itemId);

        String key = ITEM_CACHE_PREFIX + itemId;
        Object value = redisTemplate.opsForValue().get(key);

        if (value instanceof ItemCacheDTO) {
            log.debug("Item found in cache: {}", itemId);
            return Optional.of((ItemCacheDTO) value);
        }

        log.debug("Item not found in cache: {}", itemId);
        return Optional.empty();
    }

    @Override
    public void updateItem(ItemCacheDTO item) {
        log.debug("Updating item in cache: {}", item.getId());
        cacheItem(item);
    }

    @Override
    public void deleteItem(String itemId) {
        log.debug("Deleting item from cache: {}", itemId);

        String key = ITEM_CACHE_PREFIX + itemId;
        redisTemplate.delete(key);

        log.debug("Item deleted from cache: {}", itemId);
    }

    @Override
    public boolean existsInCache(String itemId) {
        String key = ITEM_CACHE_PREFIX + itemId;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    @Override
    public void clearCache() {
        log.info("Clearing all item cache");

        var keys = redisTemplate.keys(ITEM_CACHE_PREFIX + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("Cleared {} item cache entries", keys.size());
        }
    }
}
