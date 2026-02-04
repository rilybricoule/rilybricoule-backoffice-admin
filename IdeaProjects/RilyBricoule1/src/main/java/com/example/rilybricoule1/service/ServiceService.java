package com.example.rilybricoule1.service;

import com.example.rilybricoule1.entity.Services;
import com.example.rilybricoule1.repository.ServiceRepository;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class ServiceService implements ServiceServiceInter {

    private final ServiceRepository serviceRepository;

    public ServiceService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public Services create(Services services) {
        return serviceRepository.save(services);
    }

    @Override
    public Services update(Long id, Services services) {
        Services existing = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        existing.setNom(services.getNom());
        existing.setDescription(services.getDescription());
        existing.setPrix(services.getPrix());
        existing.setCategory(services.getCategory());
        existing.setPrestataire(services.getPrestataire());

        return serviceRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        serviceRepository.deleteById(id);
    }

    @Override
    public Services getById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
    }

    @Override
    public List<Services> getAll() {
        return serviceRepository.findAll();
    }

    @Override
    public List<Services> getByCategory(Long categoryId) {
        return serviceRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<Services> getByPrestataire(Long prestataireId) {
        return serviceRepository.findByPrestataireId(prestataireId);
    }
}
