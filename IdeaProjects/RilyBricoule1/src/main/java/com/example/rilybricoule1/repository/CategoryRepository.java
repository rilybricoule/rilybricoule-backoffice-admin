package com.example.rilybricoule1.repository;


import com.example.rilybricoule1.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {


    Optional<Category> findByName(String name);


    List<Category> findByParentIsNull();


    List<Category> findByParentId(Long parentId);

    // 🔹 Count prestataires per category (ADMIN DASHBOARD)
    @Query("""
        SELECT COUNT(p)
        FROM Category c
        JOIN c.prestataires p
        WHERE c.id = :categoryId
    """)
    long countPrestatairesByCategory(@Param("categoryId") Long categoryId);

    // 🔹 Load category with attributes (avoid N+1)
    @Query("""
        SELECT DISTINCT c
        FROM Category c
        LEFT JOIN FETCH c.attributes
        WHERE c.id = :id
    """)
    Optional<Category> findWithAttributes(@Param("id") Long id);

    // 🔹 Load full category tree (parent + subcategories)
    @Query("""
        SELECT DISTINCT c
        FROM Category c
        LEFT JOIN FETCH c.subCategories
        WHERE c.parent IS NULL
    """)
    List<Category> findRootCategoriesWithChildren();
}
