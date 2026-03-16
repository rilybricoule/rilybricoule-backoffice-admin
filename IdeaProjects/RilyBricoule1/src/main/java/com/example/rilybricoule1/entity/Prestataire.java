package com.example.rilybricoule1.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "prestataires")
public class Prestataire extends User {


    private String zoneIntervention;


    private String disponibilites;


    private Double latitude;
    private Double longitude;


    @OneToMany(mappedBy = "prestataire")
    private List<Services> catalogue;


    @OneToMany(mappedBy = "prestataire")
    private List<Reservation> historique;


    @OneToMany(mappedBy = "prestataire")
    private List<Avis> avisRecus;


    @OneToMany(mappedBy = "prestataire")
    private List<Notification> notifications;


    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "geolocalisation_id")
    private Geolocalisation geolocalisation;

    @ManyToMany
    @JoinTable(
            name = "prestataire_category",
            joinColumns = @JoinColumn(name = "prestataire_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;

}
