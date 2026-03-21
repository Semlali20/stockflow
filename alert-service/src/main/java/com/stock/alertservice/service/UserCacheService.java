package com.stock.alertservice.service;

import com.stock.alertservice.dto.cache.UserCacheDTO;

import java.util.Optional;

/**
 * Service pour gérer le cache Redis des utilisateurs
 */
public interface UserCacheService {

    /**
     * Mettre en cache un utilisateur
     */
    void cacheUser(UserCacheDTO user);

    /**
     * Récupérer un utilisateur du cache
     */
    Optional<UserCacheDTO> getUser(String userId);

    /**
     * Mettre à jour un utilisateur dans le cache
     */
    void updateUser(UserCacheDTO user);

    /**
     * Supprimer un utilisateur du cache
     */
    void deleteUser(String userId);

    /**
     * Vérifier si un utilisateur existe dans le cache
     */
    boolean existsInCache(String userId);

    /**
     * Vider tout le cache des utilisateurs
     */
    void clearCache();
}
