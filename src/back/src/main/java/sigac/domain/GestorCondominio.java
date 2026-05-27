package sigac.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "gestores_condominio", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "condominio_id", "user_id" })
})
public class GestorCondominio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominio_id", nullable = false)
    private Condominio condominio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Condominio getCondominio() { return condominio; }
    public void setCondominio(Condominio condominio) { this.condominio = condominio; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
