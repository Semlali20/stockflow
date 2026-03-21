package com.stock.movementservice.service.cache;

import com.stock.movementservice.event.dto.ItemEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String ITEM_CACHE_PREFIX = "movement:item:";
    private static final long CACHE_TTL_HOURS = 24;

    public void cacheItem(ItemEvent item) {
        String key = ITEM_CACHE_PREFIX + item.getId();
        redisTemplate.opsForValue().set(key, item, CACHE_TTL_HOURS, TimeUnit.HOURS);
        log.info("Cached item: {}", item.getId());
    }

    public Optional<ItemEvent> getItem(String itemId) {
        String key = ITEM_CACHE_PREFIX + itemId;
        ItemEvent item = (ItemEvent) redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(item);
    }

    public void deleteItem(String itemId) {
        String key = ITEM_CACHE_PREFIX + itemId;
        redisTemplate.delete(key);
        log.info("Deleted cached item: {}", itemId);
    }

    public boolean itemExists(String itemId) {
        return getItem(itemId).isPresent();
    }
}