package com.stock.inventoryservice.controller;

import com.stock.inventoryservice.dto.cache.ItemCacheDTO;
import com.stock.inventoryservice.service.ItemCacheService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin controller for managing Item cache
 * Used for debugging, cache warming, and manual cache operations
 */
@RestController
@RequestMapping("/api/v1/admin/cache/items")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Item Cache (Admin)", description = "Admin endpoints for item cache management")
@PreAuthorize("hasRole('ADMIN')")
public class ItemCacheController {

    private final ItemCacheService itemCacheService;

    @GetMapping("/{itemId}")
    @Operation(summary = "Get item from cache", description = "Retrieve cached item details")
    @ApiResponse(responseCode = "200", description = "Item found in cache")
    @ApiResponse(responseCode = "404", description = "Item not found in cache")
    public ResponseEntity<ItemCacheDTO> getItemFromCache(
            @Parameter(description = "Item ID", required = true)
            @PathVariable String itemId) {
        log.info("Admin request to get item from cache: {}", itemId);

        ItemCacheDTO item = itemCacheService.getItem(itemId);
        return ResponseEntity.ok(item);
    }

    @GetMapping
    @Operation(summary = "Get all cached items", description = "Retrieve all items currently in cache")
    @ApiResponse(responseCode = "200", description = "List of cached items")
    public ResponseEntity<List<ItemCacheDTO>> getAllCachedItems() {
        log.info("Admin request to get all cached items");

        List<ItemCacheDTO> items = itemCacheService.getAllCachedItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/exists/{itemId}")
    @Operation(summary = "Check if item exists in cache", description = "Check cache existence without throwing exception")
    @ApiResponse(responseCode = "200", description = "Returns true/false")
    public ResponseEntity<Boolean> existsInCache(@PathVariable String itemId) {
        log.info("Admin request to check if item exists in cache: {}", itemId);

        boolean exists = itemCacheService.existsInCache(itemId);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/size")
    @Operation(summary = "Get cache size", description = "Get number of items currently cached")
    @ApiResponse(responseCode = "200", description = "Cache size returned")
    public ResponseEntity<Map<String, Long>> getCacheSize() {
        log.info("Admin request to get cache size");

        long size = itemCacheService.getCacheSize();
        return ResponseEntity.ok(Map.of("cacheSize", size));
    }

    @PostMapping("/{itemId}")
    @Operation(summary = "Manually cache item", description = "Manually add/update an item in cache")
    @ApiResponse(responseCode = "200", description = "Item cached successfully")
    public ResponseEntity<String> cacheItem(
            @PathVariable String itemId,
            @RequestBody ItemCacheDTO item) {
        log.info("Admin request to manually cache item: {}", itemId);

        itemCacheService.cacheItem(item);
        return ResponseEntity.ok("Item cached successfully");
    }

    @PostMapping("/warm-up")
    @Operation(summary = "Warm up cache", description = "Bulk load items into cache")
    @ApiResponse(responseCode = "200", description = "Cache warmed up successfully")
    public ResponseEntity<String> warmUpCache(@RequestBody List<ItemCacheDTO> items) {
        log.info("Admin request to warm up cache with {} items", items.size());

        itemCacheService.warmUpCache(items);
        return ResponseEntity.ok("Cache warmed up with " + items.size() + " items");
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Delete item from cache", description = "Remove item from cache")
    @ApiResponse(responseCode = "204", description = "Item deleted from cache")
    public ResponseEntity<Void> deleteItemFromCache(@PathVariable String itemId) {
        log.info("Admin request to delete item from cache: {}", itemId);

        itemCacheService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    @Operation(
            summary = "Clear entire cache",
            description = "⚠️ WARNING: Clears all cached items. Use with caution!"
    )
    @ApiResponse(responseCode = "204", description = "Cache cleared successfully")
    public ResponseEntity<Void> clearCache() {
        log.warn("Admin request to clear entire item cache");

        itemCacheService.clearCache();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    @Operation(summary = "Cache health check", description = "Check cache connectivity and basic stats")
    @ApiResponse(responseCode = "200", description = "Cache health information")
    public ResponseEntity<Map<String, Object>> getCacheHealth() {
        log.info("Admin request to check cache health");

        try {
            long size = itemCacheService.getCacheSize();

            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "cacheSize", size,
                    "cacheType", "Redis"
            ));
        } catch (Exception e) {
            log.error("Cache health check failed", e);
            return ResponseEntity.status(503).body(Map.of(
                    "status", "DOWN",
                    "error", e.getMessage()
            ));
        }
    }
}
