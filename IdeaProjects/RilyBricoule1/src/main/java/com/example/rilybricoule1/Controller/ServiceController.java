package com.example.rilybricoule1.Controller;



import com.example.rilybricoule1.entity.Services;
import com.example.rilybricoule1.service.ServiceServiceInter;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceServiceInter serviceService;

    // 🔹 Injection via interface → couplage faible
    public ServiceController(ServiceServiceInter serviceService) {
        this.serviceService = serviceService;
    }

    // 🔹 Create service (prestataire)
    @PostMapping
    public Services create(@RequestBody Services service) {
        return serviceService.create(service);
    }

    // 🔹 Update service
    @PutMapping("/{id}")
    public Services update(
            @PathVariable Long id,
            @RequestBody Services service
    ) {
        return serviceService.update(id, service);
    }

    // 🔹 Delete service
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        serviceService.delete(id);
    }

    // 🔹 Get service by id
    @GetMapping("/{id}")
    public Services getById(@PathVariable Long id) {
        return serviceService.getById(id);
    }

    // 🔹 Get all services
    @GetMapping
    public List<Services> getAll() {
        return serviceService.getAll();
    }

    // 🔹 Get services by category
    @GetMapping("/category/{categoryId}")
    public List<Services> getByCategory(@PathVariable Long categoryId) {
        return serviceService.getByCategory(categoryId);
    }

    // 🔹 Get services by prestataire
    @GetMapping("/prestataire/{prestataireId}")
    public List<Services> getByPrestataire(@PathVariable Long prestataireId) {
        return serviceService.getByPrestataire(prestataireId);
    }
}

