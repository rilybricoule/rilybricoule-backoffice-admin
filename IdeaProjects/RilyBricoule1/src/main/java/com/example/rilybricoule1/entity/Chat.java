package com.example.rilybricoule1.entity;


import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One chat has many messages
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL)
    private List<Message> messages;



    // Constructors
    protected Chat() {} // required by JPA

    public Chat(List<Message> messages) {
        this.messages = messages;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
}
