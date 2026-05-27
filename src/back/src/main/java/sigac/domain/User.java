package sigac.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    @Email
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GestorCondominio> condominiosComoGestor = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SindicoCondominio> condominiosComoSindico = new HashSet<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Set<GestorCondominio> getCondominiosComoGestor() { return condominiosComoGestor; }
    public void setCondominiosComoGestor(Set<GestorCondominio> condominiosComoGestor) { this.condominiosComoGestor = condominiosComoGestor; }
    public Set<SindicoCondominio> getCondominiosComoSindico() { return condominiosComoSindico; }
    public void setCondominiosComoSindico(Set<SindicoCondominio> condominiosComoSindico) { this.condominiosComoSindico = condominiosComoSindico; }
}
