package com.example.rilybricoule1.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Services {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @Column(length = 1000)
    private String description;

    private Double prix;


    @ManyToOne
    @JoinColumn(name = "prestataire_id")
    private Prestataire prestataire;


    @OneToMany(mappedBy = "service")
    private List<Reservation> reservations;


    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"description", "subCategories", "attributes", "prestataires"})
    private Category category;

    public Services() {
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrix() {
        return prix;
    }

    public Prestataire getPrestataire() {
        return prestataire;
    }

    public List<Reservation> getReservations() {
        return reservations;
    }

    public Category getCategory() {
        return category;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setPrix(Double prix) {
        this.prix = prix;
    }

    public void setPrestataire(Prestataire prestataire) {
        this.prestataire = prestataire;
    }

    public void setReservations(List<Reservation> reservations) {
        this.reservations = reservations;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
