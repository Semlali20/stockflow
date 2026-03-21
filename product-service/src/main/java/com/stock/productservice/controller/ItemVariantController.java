package com.stock.productservice.controller;

import com.stock.productservice.dto.ItemVariantCreateRequest;
import com.stock.productservice.dto.ItemVariantDTO;
import com.stock.productservice.dto.ItemVariantUpdateRequest;
import com.stock.productservice.service.ItemVariantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item-variants")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Item Variant Management", description = "Item variant management endpoints")
public class ItemVariantController {

    private final ItemVariantService itemVariantService;

    @PostMapping
    @Operation(summary = "Create item variant", description = "Create a new item variant")
    public ResponseEntity<ItemVariantDTO> createItemVariant(@Valid @RequestBody ItemVariantCreateRequest request) {
        log.info("REST request to create item variant: {}", request.getSku());
        ItemVariantDTO created = itemVariantService.createItemVariant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item variant by ID", description = "Get item variant details by ID")
    public ResponseEntity<ItemVariantDTO> getItemVariantById(@PathVariable String id) {
        log.info("REST request to get item variant by ID: {}", id);
        ItemVariantDTO itemVariant = itemVariantService.getItemVariantById(id);
        return ResponseEntity.ok(itemVariant);
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get item variant by SKU", description = "Get item variant details by SKU")
    public ResponseEntity<ItemVariantDTO> getItemVariantByCode(@PathVariable String sku) {
        log.info("REST request to get item variant by SKU: {}", sku);
        ItemVariantDTO itemVariant = itemVariantService.getItemVariantByCode(sku);
        return ResponseEntity.ok(itemVariant);
    }

    @GetMapping
    @Operation(summary = "Get all item variants", description = "Get all item variants with optional filters")
    public ResponseEntity<List<ItemVariantDTO>> getAllItemVariants(
            @RequestParam(required = false) Boolean active) {
        log.info("REST request to get all item variants - active: {}", active);

        List<ItemVariantDTO> itemVariants;

        if (active != null && active) {
            itemVariants = itemVariantService.getActiveItemVariants();
        } else {
            itemVariants = itemVariantService.getAllItemVariants();
        }

        return ResponseEntity.ok(itemVariants);
    }

    @GetMapping("/search")
    @Operation(summary = "Search item variants", description = "Search item variants by keyword")
    public ResponseEntity<List<ItemVariantDTO>> searchItemVariants(@RequestParam String keyword) {
        log.info("REST request to search item variants with keyword: {}", keyword);
        List<ItemVariantDTO> itemVariants = itemVariantService.searchItemVariants(keyword);
        return ResponseEntity.ok(itemVariants);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update item variant", description = "Update an existing item variant")
    public ResponseEntity<ItemVariantDTO> updateItemVariant(
            @PathVariable String id,
            @Valid @RequestBody ItemVariantUpdateRequest request) {
        log.info("REST request to update item variant with ID: {}", id);
        ItemVariantDTO updated = itemVariantService.updateItemVariant(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete item variant", description = "Delete an item variant")
    public ResponseEntity<Void> deleteItemVariant(@PathVariable String id) {
        log.info("REST request to delete item variant with ID: {}", id);
        itemVariantService.deleteItemVariant(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate item variant", description = "Activate an item variant")
    public ResponseEntity<Void> activateItemVariant(@PathVariable String id) {
        log.info("REST request to activate item variant with ID: {}", id);
        itemVariantService.activateItemVariant(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate item variant", description = "Deactivate an item variant")
    public ResponseEntity<Void> deactivateItemVariant(@PathVariable String id) {
        log.info("REST request to deactivate item variant with ID: {}", id);
        itemVariantService.deactivateItemVariant(id);
        return ResponseEntity.ok().build();
    }
}