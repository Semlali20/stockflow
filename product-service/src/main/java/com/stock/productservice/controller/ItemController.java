package com.stock.productservice.controller;

import com.stock.productservice.dto.ItemCreateRequest;
import com.stock.productservice.dto.ItemDTO;
import com.stock.productservice.dto.ItemUpdateRequest;
import com.stock.productservice.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Item Management", description = "Item management endpoints")
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    @Operation(summary = "Create item", description = "Create a new item")
    public ResponseEntity<ItemDTO> createItem(@Valid @RequestBody ItemCreateRequest request) {
        log.info("REST request to create item: {}", request.getSku());
        ItemDTO created = itemService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item by ID", description = "Get item details by ID")
    public ResponseEntity<ItemDTO> getItemById(@PathVariable String id) {
        log.info("REST request to get item by ID: {}", id);
        ItemDTO item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get item by SKU", description = "Get item details by SKU")
    public ResponseEntity<ItemDTO> getItemBySku(@PathVariable String sku) {
        log.info("REST request to get item by SKU: {}", sku);
        ItemDTO item = itemService.getItemBySku(sku);
        return ResponseEntity.ok(item);
    }

    @GetMapping
    @Operation(summary = "Get all items", description = "Get all items with optional filters and pagination")
    public ResponseEntity<Page<ItemDTO>> getAllItems(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        log.info("REST request to get all items - categoryId: {}, active: {}", categoryId, active);
        return ResponseEntity.ok(itemService.getAllItems(categoryId, active, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search items", description = "Search items by keyword")
    public ResponseEntity<Page<ItemDTO>> searchItems(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        log.info("REST request to search items with keyword: {}", keyword);
        return ResponseEntity.ok(itemService.searchItems(keyword, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update item", description = "Update an existing item")
    public ResponseEntity<ItemDTO> updateItem(
            @PathVariable String id,
            @Valid @RequestBody ItemUpdateRequest request) {
        log.info("REST request to update item with ID: {}", id);
        ItemDTO updated = itemService.updateItem(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete item", description = "Delete an item")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        log.info("REST request to delete item with ID: {}", id);
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate item", description = "Activate an item")
    public ResponseEntity<Void> activateItem(@PathVariable String id) {
        log.info("REST request to activate item with ID: {}", id);
        itemService.activateItem(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate item", description = "Deactivate an item")
    public ResponseEntity<Void> deactivateItem(@PathVariable String id) {
        log.info("REST request to deactivate item with ID: {}", id);
        itemService.deactivateItem(id);
        return ResponseEntity.ok().build();
    }
}