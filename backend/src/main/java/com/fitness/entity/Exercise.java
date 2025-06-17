package com.fitness.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "exercises")
public class Exercise {
    
    @Id
    private String id;
    
    @NotBlank(message = "动作名称不能为空")
    @Size(max = 100, message = "动作名称长度不能超过100个字符")
    @Column(nullable = false, length = 100)
    private String name;
    
    @NotBlank(message = "肌肉群不能为空")
    @Size(max = 50, message = "肌肉群长度不能超过50个字符")
    @Column(name = "muscle_group", nullable = false, length = 50)
    private String muscleGroup;
    
    @Size(max = 100, message = "器械名称长度不能超过100个字符")
    @Column(length = 100)
    private String equipment;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    public Exercise() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Exercise(String id, String name, String muscleGroup, String equipment) {
        this.id = id;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.equipment = equipment;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getMuscleGroup() {
        return muscleGroup;
    }
    
    public void setMuscleGroup(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }
    
    public String getEquipment() {
        return equipment;
    }
    
    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
} 