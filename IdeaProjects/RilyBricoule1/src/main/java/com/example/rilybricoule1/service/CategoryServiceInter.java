package com.example.rilybricoule1.service;

import com.example.rilybricoule1.entity.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryServiceInter {


    List<Category> getAllCategories();

    Optional<Category> findById(Long id);

    Optional<Category> findByName(String name);

    Category saveCategory(Category category);

    void deleteCategory(Long categoryId);

    // -------------------------------
    // 2️⃣ Category hierarchy
    // -------------------------------

    List<Category> getRootCategories();

    List<Category> getSubCategories(Long parentId);

    List<Category> getFullCategoryTree();

    // -------------------------------
    // 3️⃣ Attributes & prestataire count
    // -------------------------------

    Optional<Category> getCategoryWithAttributes(Long id);

    long countPrestataires(Long categoryId);


}
