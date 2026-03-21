package com.stock.productservice.service;

import com.stock.productservice.dto.ItemVariantCreateRequest;
import com.stock.productservice.dto.ItemVariantDTO;
import com.stock.productservice.dto.ItemVariantUpdateRequest;

import java.util.List;

public interface ItemVariantService {

    ItemVariantDTO createItemVariant(ItemVariantCreateRequest request);

    ItemVariantDTO getItemVariantById(String id);

    ItemVariantDTO getItemVariantByCode(String code);

    List<ItemVariantDTO> getAllItemVariants();

    List<ItemVariantDTO> getActiveItemVariants();

    List<ItemVariantDTO> searchItemVariants(String keyword);

    ItemVariantDTO updateItemVariant(String id, ItemVariantUpdateRequest request);

    void deleteItemVariant(String id);

    void activateItemVariant(String id);

    void deactivateItemVariant(String id);
}