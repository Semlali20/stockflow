package com.stock.productservice.service;

import com.stock.productservice.dto.CategoryCreateRequest;
import com.stock.productservice.dto.CategoryDTO;
import com.stock.productservice.dto.CategoryUpdateRequest;

import java.util.List;

public interface CategoryService {

    CategoryDTO createCategory(CategoryCreateRequest request);

    CategoryDTO getCategoryById(String id);

    CategoryDTO getCategoryByName(String name);

    List<CategoryDTO> getAllCategories();

    List<CategoryDTO> getCategoriesByParentId(String parentId);

    List<CategoryDTO> getRootCategories();

    List<CategoryDTO> getActiveCategories();

    CategoryDTO updateCategory(String id, CategoryUpdateRequest request);

    void deleteCategory(String id);

    void activateCategory(String id);

    void deactivateCategory(String id);
}