package com.example.rilybricoule1.Controller;

import com.example.rilybricoule1.entity.CategoryAttribute;
import com.example.rilybricoule1.service.CategoryAttributeServiceInter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories/{categoryId}/attributes")
public class CategoryAttributeController {

    private final CategoryAttributeServiceInter attributeService;

    public CategoryAttributeController(CategoryAttributeServiceInter attributeService) {
        this.attributeService = attributeService;
    }

    // 🔹 Accessible à tout le monde (lecture)
    @GetMapping
    public List<CategoryAttribute> getAttributesByCategory(@PathVariable Long categoryId) {
        return attributeService.getAttributesByCategory(categoryId);
    }

    // 🔹 ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public CategoryAttribute addAttribute(
            @PathVariable Long categoryId,
            @RequestBody CategoryAttribute attribute) {
        return attributeService.addAttribute(categoryId, attribute);
    }

    // 🔹 ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{attributeId}")
    public void deleteAttribute(@PathVariable Long attributeId) {
        attributeService.deleteAttribute(attributeId);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{attributeId}")
    public CategoryAttribute updateAttribute(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId,
            @RequestBody CategoryAttribute updatedAttribute) {

        return attributeService.updateAttribute(categoryId, attributeId, updatedAttribute);
    }
}
