package com.example.rilybricoule1.service;

import com.example.rilybricoule1.entity.Services;

import java.util.List;

public interface ServiceServiceInter {

    Services create(Services services);

    Services update(Long id, Services services);

    void delete(Long id);

    Services getById(Long id);

    List<Services> getAll();

    List<Services> getByCategory(Long categoryId);

    List<Services> getByPrestataire(Long prestataireId);
}
