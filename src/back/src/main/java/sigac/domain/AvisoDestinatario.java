package sigac.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "aviso_destinatarios")
public class AvisoDestinatario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aviso_id", nullable = false)
    private Aviso aviso;

    @Column(name = "inquilino_id")
    private Long inquilinoId;

    @NotBlank
    @Column(nullable = false, length = 160)
    private String nome;

    @NotBlank
    @Email
    @Column(nullable = false, length = 200)
    private String email;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Aviso getAviso() { return aviso; }
    public void setAviso(Aviso aviso) { this.aviso = aviso; }
    public Long getInquilinoId() { return inquilinoId; }
    public void setInquilinoId(Long inquilinoId) { this.inquilinoId = inquilinoId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
