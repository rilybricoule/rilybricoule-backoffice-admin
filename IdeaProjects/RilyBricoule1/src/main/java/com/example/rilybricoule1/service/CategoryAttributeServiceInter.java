package com.example.rilybricoule1.service;

import com.example.rilybricoule1.entity.CategoryAttribute;

import java.util.List;

public interface CategoryAttributeServiceInter {

     CategoryAttribute updateAttribute(Long categoryId, Long attributeId, CategoryAttribute updated);
    /**
     * Add an attribute to a category
     * @param categoryId the id of the category
     * @param attribute the attribute to add
     * @return the saved attribute
     */
    CategoryAttribute addAttribute(Long categoryId, CategoryAttribute attribute);

    /**
     * Get all attributes for a given category
     * @param categoryId the id of the category
     * @return list of attributes
     */
    List<CategoryAttribute> getAttributesByCategory(Long categoryId);

    /**
     * Delete an attribute by its id
     * @param attributeId the id of the attribute
     */
    void deleteAttribute(Long attributeId);





}
