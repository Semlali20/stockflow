package com.stock.productservice.service;

import com.stock.productservice.dto.CategoryCreateRequest;
import com.stock.productservice.dto.CategoryDTO;
import com.stock.productservice.dto.CategoryUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    CategoryDTO createCategory(CategoryCreateRequest request);

    CategoryDTO getCategoryById(String id);

    CategoryDTO getCategoryByName(String name);

    Page<CategoryDTO> getAllCategories(String parentId, Boolean active, Boolean rootOnly, Pageable pageable);

    CategoryDTO updateCategory(String id, CategoryUpdateRequest request);

    void deleteCategory(String id);

    void activateCategory(String id);

    void deactivateCategory(String id);
}
