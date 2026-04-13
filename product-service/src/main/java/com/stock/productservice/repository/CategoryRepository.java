package com.stock.productservice.repository;

import com.stock.productservice.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    Optional<Category> findByName(String name);

    List<Category> findByParentCategoryId(String parentCategoryId);

    List<Category> findByIsActive(Boolean isActive);

    boolean existsByName(String name);

    @Query("SELECT c FROM Category c WHERE c.parentCategoryId IS NULL")
    List<Category> findRootCategories();

    @Query("SELECT c FROM Category c WHERE c.isActive = true")
    List<Category> findActiveCategories();
}