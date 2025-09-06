package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="profile")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Column(unique = true, name="user_key_cloak_id")
    String userKeyCloakId;
    @Column(unique = true)
    String email;
    @Column(unique = true)
    String username;
    @Column(name= "first_name")
    String firstName;
    @Column(name = "last_name")
    String lastName;
    String phone;
    LocalDate dob;
    boolean sex;
    String avatar;
    String address;
    boolean active;

    @ManyToMany
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "profile_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    Set<Role> roles;
}
