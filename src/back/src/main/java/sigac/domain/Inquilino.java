package sigac.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "inquilinos")
public class Inquilino {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Email
    @Column(nullable = false)
    private String email;

    /** Ex.: "3", "Térreo" */
    @Column(length = 30)
    private String andar;

    /** Ex.: "101", "12B" */
    @Column(length = 30)
    private String apartamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominio_id", nullable = false)
    private Condominio condominio;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAndar() { return andar; }
    public void setAndar(String andar) { this.andar = andar; }
    public String getApartamento() { return apartamento; }
    public void setApartamento(String apartamento) { this.apartamento = apartamento; }
    public Condominio getCondominio() { return condominio; }
    public void setCondominio(Condominio condominio) { this.condominio = condominio; }
}
