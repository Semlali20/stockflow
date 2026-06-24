package com.stock.productservice.repository;

import com.stock.productservice.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    Optional<Category> findByName(String name);

    List<Category> findByParentCategoryId(String parentCategoryId);

    Page<Category> findByParentCategoryId(String parentCategoryId, Pageable pageable);

    List<Category> findByIsActive(Boolean isActive);

    Page<Category> findByIsActive(Boolean isActive, Pageable pageable);

    boolean existsByName(String name);

    @Query("SELECT c FROM Category c WHERE c.parentCategoryId IS NULL")
    List<Category> findRootCategories();

    @Query(value = "SELECT c FROM Category c WHERE c.parentCategoryId IS NULL",
           countQuery = "SELECT COUNT(c) FROM Category c WHERE c.parentCategoryId IS NULL")
    Page<Category> findRootCategories(Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.isActive = true")
    List<Category> findActiveCategories();

    @Query(value = "SELECT c FROM Category c WHERE c.isActive = true",
           countQuery = "SELECT COUNT(c) FROM Category c WHERE c.isActive = true")
    Page<Category> findActiveCategories(Pageable pageable);
}