package com.example.rilybricoule1.entity;

import com.example.rilybricoule1.entity.Prestataire;
import com.example.rilybricoule1.entity.User;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "clients")
public class Client extends User {

    @Column(name = "adresse")
    private String adresse;

    // Un client peut avoir plusieurs favoris (relation Many-to-Many avec Prestataire)
    @ManyToMany
    @JoinTable(
            name = "client_favoris",
            joinColumns = @JoinColumn(name = "client_id"),
            inverseJoinColumns = @JoinColumn(name = "prestataire_id")
    ) private List<Prestataire> favoris;


    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Reservation> reservations;


    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Avis> avisEmis;



    public Client(String adresse, List<Prestataire> favoris, List<Reservation> reservations, List<Avis> avisEmis) {
        this.adresse = adresse;
        this.favoris = favoris;
        this.reservations = reservations;
        this.avisEmis = avisEmis;
    }

    protected Client() {

    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public List<Prestataire> getFavoris() {
        return favoris;
    }

    public void setFavoris(List<Prestataire> favoris) {
        this.favoris = favoris;
    }

    public List<Reservation> getReservations() {
        return reservations;
    }

    public void setReservations(List<Reservation> reservations) {
        this.reservations = reservations;
    }

    public List<Avis> getAvisEmis() {
        return avisEmis;
    }

    public void setAvisEmis(List<Avis> avisEmis) {
        this.avisEmis = avisEmis;
    }
}
