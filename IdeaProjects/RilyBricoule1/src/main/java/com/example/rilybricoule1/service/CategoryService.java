package com.example.rilybricoule1.service;

import com.example.rilybricoule1.entity.Category;
import com.example.rilybricoule1.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService implements CategoryServiceInter {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }



    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public Optional<Category> findByName(String name) {
        return categoryRepository.findByName(name);
    }

    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long categoryId) {
        // ✅ Prevent deletion if prestataires exist
        long count = categoryRepository.countPrestatairesByCategory(categoryId);
        if (count > 0) {
            throw new IllegalStateException("Cannot delete category: it has prestataires");
        }

        // ✅ Optional: prevent deletion if it has subcategories
        List<Category> subCategories = categoryRepository.findByParentId(categoryId);
        if (!subCategories.isEmpty()) {
            throw new IllegalStateException("Cannot delete category: it has subcategories");
        }

        categoryRepository.deleteById(categoryId);
    }

    // -------------------------------
    // 2️⃣ Category hierarchy
    // -------------------------------

    public List<Category> getRootCategories() {
        return categoryRepository.findByParentIsNull();
    }

    public List<Category> getSubCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId);
    }

    public List<Category> getFullCategoryTree() {
        return categoryRepository.findRootCategoriesWithChildren();
    }

    // -------------------------------
    // 3️⃣ Attributes & prestataire count
    // -------------------------------

    public Optional<Category> getCategoryWithAttributes(Long id) {
        return categoryRepository.findWithAttributes(id);
    }

    public long countPrestataires(Long categoryId) {
        return categoryRepository.countPrestatairesByCategory(categoryId);
    }





}
