package com.example.rilybricoule1.service;

import com.example.rilybricoule1.entity.Category;
import com.example.rilybricoule1.entity.CategoryAttribute;
import com.example.rilybricoule1.repository.CategoryAttributeRepository;
import com.example.rilybricoule1.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryAttributeService implements CategoryAttributeServiceInter {

    private final CategoryAttributeRepository attributeRepository;
    private final CategoryRepository categoryRepository;

    public CategoryAttributeService(
            CategoryAttributeRepository attributeRepository,
            CategoryRepository categoryRepository) {
        this.attributeRepository = attributeRepository;
        this.categoryRepository = categoryRepository;
    }

    public CategoryAttribute addAttribute(Long categoryId, CategoryAttribute attribute) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        attribute.setCategory(category);
        return attributeRepository.save(attribute);
    }

    public List<CategoryAttribute> getAttributesByCategory(Long categoryId) {
        return attributeRepository.findByCategoryId(categoryId);
    }
    public CategoryAttribute updateAttribute(Long categoryId, Long attributeId, CategoryAttribute updated) {
        // 1️⃣ Find the attribute
        CategoryAttribute existing = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));

        // 2️⃣ Optional: check it belongs to the category
        if (!existing.getCategory().getId().equals(categoryId)) {
            throw new RuntimeException("Attribute does not belong to this category");
        }

        // 3️⃣ Update fields
        existing.setName(updated.getName());
        existing.setType(updated.getType());

        // 4️⃣ Save changes
        return attributeRepository.save(existing);
    }





    public void deleteAttribute(Long attributeId) {
        attributeRepository.deleteById(attributeId);
    }
}
