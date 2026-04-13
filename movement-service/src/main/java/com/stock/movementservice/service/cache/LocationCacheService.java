package com.stock.movementservice.service.cache;

import com.stock.movementservice.event.dto.LocationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String LOCATION_CACHE_PREFIX = "movement:location:";
    private static final long CACHE_TTL_HOURS = 24;

    public void cacheLocation(LocationEvent location) {
        String key = LOCATION_CACHE_PREFIX + location.getLocationId();
        redisTemplate.opsForValue().set(key, location, CACHE_TTL_HOURS, TimeUnit.HOURS);
        log.info("Cached location: {}", location.getLocationId());
    }

    public Optional<LocationEvent> getLocation(String locationId) {
        String key = LOCATION_CACHE_PREFIX + locationId;
        LocationEvent location = (LocationEvent) redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(location);
    }

    public void deleteLocation(String locationId) {
        String key = LOCATION_CACHE_PREFIX + locationId;
        redisTemplate.delete(key);
        log.info("Deleted cached location: {}", locationId);
    }

    public boolean locationExists(String locationId) {
        return getLocation(locationId).isPresent();
    }

    public boolean isLocationActive(String locationId) {
        return getLocation(locationId)
            .map(LocationEvent::getIsActive)
            .orElse(false);
    }
}