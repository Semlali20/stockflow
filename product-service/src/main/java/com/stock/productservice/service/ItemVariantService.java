package com.stock.productservice.service;

import com.stock.productservice.dto.ItemVariantCreateRequest;
import com.stock.productservice.dto.ItemVariantDTO;
import com.stock.productservice.dto.ItemVariantUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ItemVariantService {

    ItemVariantDTO createItemVariant(ItemVariantCreateRequest request);

    ItemVariantDTO getItemVariantById(String id);

    ItemVariantDTO getItemVariantByCode(String code);

    Page<ItemVariantDTO> getAllItemVariants(Boolean active, Pageable pageable);

    Page<ItemVariantDTO> searchItemVariants(String keyword, Pageable pageable);

    ItemVariantDTO updateItemVariant(String id, ItemVariantUpdateRequest request);

    void deleteItemVariant(String id);

    void activateItemVariant(String id);

    void deactivateItemVariant(String id);
}
