package com.stock.alertservice.service;

import com.stock.alertservice.dto.cache.ItemCacheDTO;

import java.util.Optional;

/**
 * Service pour gérer le cache Redis des items
 */
public interface ItemCacheService {

    /**
     * Mettre en cache un item
     */
    void cacheItem(ItemCacheDTO item);

    /**
     * Récupérer un item du cache
     */
    Optional<ItemCacheDTO> getItem(String itemId);

    /**
     * Mettre à jour un item dans le cache
     */
    void updateItem(ItemCacheDTO item);

    /**
     * Supprimer un item du cache
     */
    void deleteItem(String itemId);

    /**
     * Vérifier si un item existe dans le cache
     */
    boolean existsInCache(String itemId);

    /**
     * Vider tout le cache des items
     */
    void clearCache();
}
