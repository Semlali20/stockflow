package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.cache.UserCacheDTO;
import com.stock.alertservice.service.UserCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserCacheServiceImpl implements UserCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String USER_CACHE_PREFIX = "alert:user:";
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    @Override
    public void cacheUser(UserCacheDTO user) {
        log.debug("Caching user: {}", user.getId());

        String key = USER_CACHE_PREFIX + user.getId();
        redisTemplate.opsForValue().set(key, user, CACHE_TTL);

        log.debug("User cached successfully: {}", user.getId());
    }

    @Override
    public Optional<UserCacheDTO> getUser(String userId) {
        log.debug("Fetching user from cache: {}", userId);

        String key = USER_CACHE_PREFIX + userId;
        Object value = redisTemplate.opsForValue().get(key);

        if (value instanceof UserCacheDTO) {
            log.debug("User found in cache: {}", userId);
            return Optional.of((UserCacheDTO) value);
        }

        log.debug("User not found in cache: {}", userId);
        return Optional.empty();
    }

    @Override
    public void updateUser(UserCacheDTO user) {
        log.debug("Updating user in cache: {}", user.getId());
        cacheUser(user);
    }

    @Override
    public void deleteUser(String userId) {
        log.debug("Deleting user from cache: {}", userId);

        String key = USER_CACHE_PREFIX + userId;
        redisTemplate.delete(key);

        log.debug("User deleted from cache: {}", userId);
    }

    @Override
    public boolean existsInCache(String userId) {
        String key = USER_CACHE_PREFIX + userId;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    @Override
    public void clearCache() {
        log.info("Clearing all user cache");

        var keys = redisTemplate.keys(USER_CACHE_PREFIX + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("Cleared {} user cache entries", keys.size());
        }
    }
}
