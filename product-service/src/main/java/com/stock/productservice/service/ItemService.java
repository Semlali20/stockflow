// ItemService.java
package com.stock.productservice.service;

import com.stock.productservice.dto.ItemCreateRequest;
import com.stock.productservice.dto.ItemDTO;
import com.stock.productservice.dto.ItemUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ItemService {

    ItemDTO createItem(ItemCreateRequest request);

    ItemDTO getItemById(String id);

    ItemDTO getItemBySku(String sku);

    Page<ItemDTO> getAllItems(String categoryId, Boolean active, Pageable pageable);

    Page<ItemDTO> searchItems(String keyword, Pageable pageable);

    ItemDTO updateItem(String id, ItemUpdateRequest request);

    void deleteItem(String id);

    void activateItem(String id);

    void deactivateItem(String id);
}
