package com.example.rilybricoule1.repository;

import com.example.rilybricoule1.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Services, Long> {

    List<Services> findByCategoryId(Long categoryId);

    // 🔹 All services of a prestataire
    List<Services> findByPrestataireId(Long prestataireId);

    // 🔹 Search services by name (case-insensitive)
    List<Services> findByNomContainingIgnoreCase(String nom);

    // 🔹 Services by category + price range


    // 🔹 Count services per category (admin stats)
    long countByCategoryId(Long categoryId);





}
