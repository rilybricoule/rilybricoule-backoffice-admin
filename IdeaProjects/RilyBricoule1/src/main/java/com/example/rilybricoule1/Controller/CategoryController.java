package com.example.rilybricoule1.Controller;

import com.example.rilybricoule1.entity.Category;
import com.example.rilybricoule1.service.CategoryService;
import com.example.rilybricoule1.service.CategoryServiceInter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryServiceInter categoryService;

    public CategoryController(CategoryServiceInter categoryService) {
        this.categoryService = categoryService;
    }

    // 🔹 Accessible à tout le monde (lecture)


    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // 🔹 ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Category create(@RequestBody Category category) {
        return categoryService.saveCategory(category);
    }

    // 🔹 ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Category update(
            @PathVariable Long id,
            @RequestBody Category category) {

        // Optional: fetch existing category first
        Category existing = categoryService.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Update fields
        existing.setName(category.getName());
        existing.setParent(category.getParent());


        return categoryService.saveCategory(existing);
    }


    // 🔹 ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}


