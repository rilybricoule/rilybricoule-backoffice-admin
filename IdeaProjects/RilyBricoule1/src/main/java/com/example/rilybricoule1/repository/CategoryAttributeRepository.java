package com.example.rilybricoule1.repository;

import com.example.rilybricoule1.entity.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryAttributeRepository
        extends JpaRepository<CategoryAttribute, Long> {

    List<CategoryAttribute> findByCategoryId(Long categoryId);





}
