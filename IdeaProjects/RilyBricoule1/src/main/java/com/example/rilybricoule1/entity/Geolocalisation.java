package com.example.rilybricoule1.entity;



import jakarta.persistence.*;

@Entity
@Table(name = "geolocalisations")
public class Geolocalisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double latitude;

    private double longitude;

    private String adresseComplete;


    @OneToOne(mappedBy = "geolocalisation", cascade = CascadeType.ALL)
    private Prestataire prestataire;

    // Constructeurs
    public Geolocalisation() {}

    public Geolocalisation(double latitude, double longitude, String adresseComplete) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.adresseComplete = adresseComplete;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getAdresseComplete() { return adresseComplete; }
    public void setAdresseComplete(String adresseComplete) { this.adresseComplete = adresseComplete; }

    public Prestataire getPrestataire() { return prestataire; }
    public void setPrestataire(Prestataire prestataire) { this.prestataire = prestataire; }
}
