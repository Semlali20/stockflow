package com.stock.productservice.service.impl;

import com.stock.productservice.dto.ItemVariantCreateRequest;
import com.stock.productservice.dto.ItemVariantDTO;
import com.stock.productservice.dto.ItemVariantUpdateRequest;
import com.stock.productservice.entity.Item;
import com.stock.productservice.entity.ItemVariant;
import com.stock.productservice.event.ItemVariantEvent;
import com.stock.productservice.event.ItemVariantEventPublisher;
import com.stock.productservice.exception.DuplicateResourceException;
import com.stock.productservice.exception.ResourceNotFoundException;
import com.stock.productservice.repository.ItemRepository;
import com.stock.productservice.repository.ItemVariantRepository;
import com.stock.productservice.service.ItemVariantService;
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
public class ItemVariantServiceImpl implements ItemVariantService {

    private final ItemVariantRepository itemVariantRepository;
    private final ItemRepository itemRepository;
    private final ItemVariantEventPublisher eventPublisher;

    @Override
    public ItemVariantDTO createItemVariant(ItemVariantCreateRequest request) {
        log.info("Creating item variant with SKU: {}", request.getSku());

        // Check if SKU already exists
        if (itemVariantRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("ItemVariant with SKU " + request.getSku() + " already exists");
        }

        // Verify parent item exists
        Item parentItem = itemRepository.findById(request.getParentItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent item not found with ID: " + request.getParentItemId()));

        ItemVariant itemVariant = ItemVariant.builder()
                .parentItemId(request.getParentItemId())
                .sku(request.getSku())
                .variantAttributes(request.getVariantAttributes())
                .isActive(true)
                .build();

        ItemVariant savedItemVariant = itemVariantRepository.save(itemVariant);
        log.info("ItemVariant created successfully with ID: {}", savedItemVariant.getId());

        ItemVariantDTO dto = mapToDTO(savedItemVariant, parentItem.getName(), parentItem.getSku());

        // Publish event
        ItemVariantEvent event = ItemVariantEvent.builder()
                .id(savedItemVariant.getId())
                .code(savedItemVariant.getSku())
                .name(parentItem.getName())
                .email(null)
                .isActive(savedItemVariant.getIsActive())
                .timestamp(LocalDateTime.now())
                .eventType("CREATED")
                .build();
        eventPublisher.publishItemVariantCreated(event);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ItemVariantDTO getItemVariantById(String id) {
        log.info("Fetching item variant with ID: {}", id);

        ItemVariant itemVariant = itemVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemVariant not found with ID: " + id));

        Item parentItem = getParentItem(itemVariant.getParentItemId());

        return mapToDTO(itemVariant, parentItem.getName(), parentItem.getSku());
    }

    @Override
    @Transactional(readOnly = true)
    public ItemVariantDTO getItemVariantByCode(String sku) {
        log.info("Fetching item variant with SKU: {}", sku);

        ItemVariant itemVariant = itemVariantRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("ItemVariant not found with SKU: " + sku));

        Item parentItem = getParentItem(itemVariant.getParentItemId());

        return mapToDTO(itemVariant, parentItem.getName(), parentItem.getSku());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemVariantDTO> getAllItemVariants() {
        log.info("Fetching all item variants");

        return itemVariantRepository.findAll().stream()
                .map(variant -> {
                    Item parentItem = getParentItem(variant.getParentItemId());
                    return mapToDTO(variant, parentItem.getName(), parentItem.getSku());
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemVariantDTO> getActiveItemVariants() {
        log.info("Fetching active item variants");

        return itemVariantRepository.findActiveItemVariants().stream()
                .map(variant -> {
                    Item parentItem = getParentItem(variant.getParentItemId());
                    return mapToDTO(variant, parentItem.getName(), parentItem.getSku());
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemVariantDTO> searchItemVariants(String keyword) {
        log.info("Searching item variants with keyword: {}", keyword);

        return itemVariantRepository.searchItemVariants(keyword).stream()
                .map(variant -> {
                    Item parentItem = getParentItem(variant.getParentItemId());
                    return mapToDTO(variant, parentItem.getName(), parentItem.getSku());
                })
                .collect(Collectors.toList());
    }

    @Override
    public ItemVariantDTO updateItemVariant(String id, ItemVariantUpdateRequest request) {
        log.info("Updating item variant with ID: {}", id);

        ItemVariant itemVariant = itemVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemVariant not found with ID: " + id));

        // Verify parent item exists if changed
        if (request.getParentItemId() != null && !request.getParentItemId().equals(itemVariant.getParentItemId())) {
            itemRepository.findById(request.getParentItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent item not found with ID: " + request.getParentItemId()));
            itemVariant.setParentItemId(request.getParentItemId());
        }

        itemVariant.setVariantAttributes(request.getVariantAttributes());

        ItemVariant updatedItemVariant = itemVariantRepository.save(itemVariant);
        log.info("ItemVariant updated successfully with ID: {}", updatedItemVariant.getId());

        Item parentItem = getParentItem(updatedItemVariant.getParentItemId());
        ItemVariantDTO dto = mapToDTO(updatedItemVariant, parentItem.getName(), parentItem.getSku());

        // Publish event
        ItemVariantEvent event = ItemVariantEvent.builder()
                .id(updatedItemVariant.getId())
                .code(updatedItemVariant.getSku())
                .name(parentItem.getName())
                .email(null)
                .isActive(updatedItemVariant.getIsActive())
                .timestamp(LocalDateTime.now())
                .eventType("UPDATED")
                .build();
        eventPublisher.publishItemVariantUpdated(event);

        return dto;
    }

    @Override
    public void deleteItemVariant(String id) {
        log.info("Deleting item variant with ID: {}", id);

        ItemVariant itemVariant = itemVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemVariant not found with ID: " + id));

        itemVariantRepository.delete(itemVariant);
        log.info("ItemVariant deleted successfully with ID: {}", id);

        Item parentItem = getParentItem(itemVariant.getParentItemId());

        // Publish event
        ItemVariantEvent event = ItemVariantEvent.builder()
                .id(itemVariant.getId())
                .code(itemVariant.getSku())
                .name(parentItem.getName())
                .email(null)
                .isActive(false)
                .timestamp(LocalDateTime.now())
                .eventType("DELETED")
                .build();
        eventPublisher.publishItemVariantDeleted(event);
    }

    @Override
    public void activateItemVariant(String id) {
        log.info("Activating item variant with ID: {}", id);

        ItemVariant itemVariant = itemVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemVariant not found with ID: " + id));

        itemVariant.setIsActive(true);
        itemVariantRepository.save(itemVariant);
        log.info("ItemVariant activated successfully with ID: {}", id);
    }

    @Override
    public void deactivateItemVariant(String id) {
        log.info("Deactivating item variant with ID: {}", id);

        ItemVariant itemVariant = itemVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemVariant not found with ID: " + id));

        itemVariant.setIsActive(false);
        itemVariantRepository.save(itemVariant);
        log.info("ItemVariant deactivated successfully with ID: {}", id);
    }

    // Helper methods
    private Item getParentItem(String parentItemId) {
        return itemRepository.findById(parentItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent item not found with ID: " + parentItemId));
    }

    private ItemVariantDTO mapToDTO(ItemVariant itemVariant, String parentItemName, String parentItemSku) {
        return ItemVariantDTO.builder()
                .id(itemVariant.getId())
                .parentItemId(itemVariant.getParentItemId())
                .parentItemName(parentItemName)
                .parentItemSku(parentItemSku)
                .sku(itemVariant.getSku())
                .variantAttributes(itemVariant.getVariantAttributes())
                .isActive(itemVariant.getIsActive())
                .createdAt(itemVariant.getCreatedAt())
                .updatedAt(itemVariant.getUpdatedAt())
                .build();
    }
}