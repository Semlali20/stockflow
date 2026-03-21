package com.stock.productservice.service.impl;

import com.stock.productservice.dto.ItemCreateRequest;
import com.stock.productservice.dto.ItemDTO;
import com.stock.productservice.dto.ItemUpdateRequest;
import com.stock.productservice.entity.Category;
import com.stock.productservice.entity.Item;
import com.stock.productservice.event.ItemEvent;
import com.stock.productservice.event.ItemEventPublisher;
import com.stock.productservice.exception.DuplicateResourceException;
import com.stock.productservice.exception.ResourceNotFoundException;
import com.stock.productservice.repository.CategoryRepository;
import com.stock.productservice.repository.ItemRepository;
import com.stock.productservice.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final ItemEventPublisher eventPublisher;

    @Override
    public ItemDTO createItem(ItemCreateRequest request) {
        log.info("Creating item with SKU: {}", request.getSku());

        // Check if SKU already exists
        if (itemRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Item with SKU " + request.getSku() + " already exists");
        }

        // Verify category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Item item = Item.builder()
                .categoryId(request.getCategoryId())
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .attributes(request.getAttributes())
                .tags(request.getTags())
                .imageUrl(request.getImageUrl())
                .isSerialized(request.getIsSerialized() != null ? request.getIsSerialized() : false)
                .isLotManaged(request.getIsLotManaged() != null ? request.getIsLotManaged() : false)
                .shelfLifeDays(request.getShelfLifeDays())
                .hazardousMaterial(request.getHazardousMaterial() != null ? request.getHazardousMaterial() : false)
                .temperatureControl(request.getTemperatureControl())
                .isActive(true)
                .build();

        Item savedItem = itemRepository.save(item);
        log.info("Item created successfully with ID: {}", savedItem.getId());

        ItemDTO dto = mapToDTO(savedItem, category.getName());

        // Publish event
        ItemEvent event = ItemEvent.builder()
                .id(savedItem.getId())
                .sku(savedItem.getSku())
                .name(savedItem.getName())
                .categoryId(savedItem.getCategoryId())
                .itemVariantId(null)
                .isActive(savedItem.getIsActive())
                // ADD THESE MISSING FIELDS:
                .isSerialized(savedItem.getIsSerialized())
                .isLotManaged(savedItem.getIsLotManaged())
                .shelfLifeDays(savedItem.getShelfLifeDays())
                .hazardousMaterial(savedItem.getHazardousMaterial())
                .temperatureControl(savedItem.getTemperatureControl())
                .timestamp(LocalDateTime.now())
                .eventType("CREATED")
                .build();
        eventPublisher.publishItemCreated(event);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ItemDTO getItemById(String id) {
        log.info("Fetching item with ID: {}", id);

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        String categoryName = getCategoryName(item.getCategoryId());

        return mapToDTO(item, categoryName);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemDTO getItemBySku(String sku) {
        log.info("Fetching item with SKU: {}", sku);

        Item item = itemRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with SKU: " + sku));

        String categoryName = getCategoryName(item.getCategoryId());

        return mapToDTO(item, categoryName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemDTO> getAllItems() {
        log.info("Fetching all items");

        return itemRepository.findAll().stream()
                .map(item -> {
                    String categoryName = getCategoryName(item.getCategoryId());
                    return mapToDTO(item, categoryName);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemDTO> getItemsByCategory(String categoryId) {
        log.info("Fetching items for category ID: {}", categoryId);

        String categoryName = getCategoryName(categoryId);

        return itemRepository.findByCategoryId(categoryId).stream()
                .map(item -> mapToDTO(item, categoryName))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemDTO> getItemsByItemVariant(String itemVariantId) {
        log.info("Fetching items for item variant ID: {}", itemVariantId);

        // Note: Based on the entity structure, ItemVariant references Item (parent_item_id)
        // This method would need different implementation or might not be needed
        // For now, returning empty list
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemDTO> getActiveItems() {
        log.info("Fetching active items");

        return itemRepository.findByIsActive(true).stream()
                .map(item -> {
                    String categoryName = getCategoryName(item.getCategoryId());
                    return mapToDTO(item, categoryName);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemDTO> searchItems(String keyword) {
        log.info("Searching items with keyword: {}", keyword);

        return itemRepository.searchItems(keyword).stream()
                .map(item -> {
                    String categoryName = getCategoryName(item.getCategoryId());
                    return mapToDTO(item, categoryName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public ItemDTO updateItem(String id, ItemUpdateRequest request) {
        log.info("Updating item with ID: {}", id);

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        // Verify category exists if changed
        if (request.getCategoryId() != null && !request.getCategoryId().equals(item.getCategoryId())) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
        }

        item.setCategoryId(request.getCategoryId());
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setAttributes(request.getAttributes());
        item.setTags(request.getTags());
        item.setImageUrl(request.getImageUrl());
        item.setIsSerialized(request.getIsSerialized());
        item.setIsLotManaged(request.getIsLotManaged());
        item.setShelfLifeDays(request.getShelfLifeDays());
        item.setHazardousMaterial(request.getHazardousMaterial());
        item.setTemperatureControl(request.getTemperatureControl());

        Item updatedItem = itemRepository.save(item);
        log.info("Item updated successfully with ID: {}", updatedItem.getId());

        String categoryName = getCategoryName(updatedItem.getCategoryId());
        ItemDTO dto = mapToDTO(updatedItem, categoryName);

        // Publish event
        ItemEvent event = ItemEvent.builder()
                .id(updatedItem.getId())
                .sku(updatedItem.getSku())
                .name(updatedItem.getName())
                .categoryId(updatedItem.getCategoryId())
                .itemVariantId(null)
                .isActive(updatedItem.getIsActive())
                // ADD THESE MISSING FIELDS:
                .isSerialized(updatedItem.getIsSerialized())
                .isLotManaged(updatedItem.getIsLotManaged())
                .shelfLifeDays(updatedItem.getShelfLifeDays())
                .hazardousMaterial(updatedItem.getHazardousMaterial())
                .temperatureControl(updatedItem.getTemperatureControl())
                .timestamp(LocalDateTime.now())
                .eventType("UPDATED")
                .build();

        return dto;
    }

    @Override
    public void deleteItem(String id) {
        log.info("Deleting item with ID: {}", id);

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        itemRepository.delete(item);
        log.info("Item deleted successfully with ID: {}", id);

        // Publish event
        ItemEvent event = ItemEvent.builder()
                .id(item.getId())
                .sku(item.getSku())
                .name(item.getName())
                .categoryId(item.getCategoryId())
                .itemVariantId(null)
                .isActive(false)
                // ADD THESE MISSING FIELDS:
                .isSerialized(item.getIsSerialized())
                .isLotManaged(item.getIsLotManaged())
                .shelfLifeDays(item.getShelfLifeDays())
                .hazardousMaterial(item.getHazardousMaterial())
                .temperatureControl(item.getTemperatureControl())
                .timestamp(LocalDateTime.now())
                .eventType("DELETED")
                .build();
        eventPublisher.publishItemDeleted(event);
    }

    @Override
    public void activateItem(String id) {
        log.info("Activating item with ID: {}", id);

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        item.setIsActive(true);
        itemRepository.save(item);
        log.info("Item activated successfully with ID: {}", id);
    }

    @Override
    public void deactivateItem(String id) {
        log.info("Deactivating item with ID: {}", id);

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        item.setIsActive(false);
        itemRepository.save(item);
        log.info("Item deactivated successfully with ID: {}", id);
    }

    // Helper methods
    private String getCategoryName(String categoryId) {
        return categoryRepository.findById(categoryId)
                .map(Category::getName)
                .orElse("Unknown");
    }

    private ItemDTO mapToDTO(Item item, String categoryName) {
        return ItemDTO.builder()
                .id(item.getId())
                .categoryId(item.getCategoryId())
                .categoryName(categoryName)
                .sku(item.getSku())
                .name(item.getName())
                .description(item.getDescription())
                .attributes(item.getAttributes())
                .tags(item.getTags())
                .imageUrl(item.getImageUrl())
                .isSerialized(item.getIsSerialized())
                .isLotManaged(item.getIsLotManaged())
                .shelfLifeDays(item.getShelfLifeDays())
                .hazardousMaterial(item.getHazardousMaterial())
                .temperatureControl(item.getTemperatureControl())
                .isActive(item.getIsActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

}
