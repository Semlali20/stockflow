// ItemService.java
package com.stock.productservice.service;

import com.stock.productservice.dto.ItemCreateRequest;
import com.stock.productservice.dto.ItemDTO;
import com.stock.productservice.dto.ItemUpdateRequest;

import java.util.List;

public interface ItemService {

    ItemDTO createItem(ItemCreateRequest request);

    ItemDTO getItemById(String id);

    ItemDTO getItemBySku(String sku);

    List<ItemDTO> getAllItems();

    List<ItemDTO> getItemsByCategory(String categoryId);

    List<ItemDTO> getItemsByItemVariant(String itemVariantId);

    List<ItemDTO> getActiveItems();

    List<ItemDTO> searchItems(String keyword);

    ItemDTO updateItem(String id, ItemUpdateRequest request);

    void deleteItem(String id);

    void activateItem(String id);

    void deactivateItem(String id);
}