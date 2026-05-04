package sigac.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "arrecadacao_mensal_logs")
public class ArrecadacaoMensalLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arrecadacao_mensal_id", nullable = false)
    private ArrecadacaoMensal arrecadacaoMensal;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime alteradoEm;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_nome", length = 200)
    private String userNome;

    @Column(name = "user_email", length = 200)
    private String userEmail;

    @Column(precision = 12, scale = 2)
    private BigDecimal valorAnterior;

    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorNovo;

    @NotNull
    @Column(nullable = false, length = 30)
    private String acao; // CRIAR | ALTERAR

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ArrecadacaoMensal getArrecadacaoMensal() { return arrecadacaoMensal; }
    public void setArrecadacaoMensal(ArrecadacaoMensal arrecadacaoMensal) { this.arrecadacaoMensal = arrecadacaoMensal; }
    public LocalDateTime getAlteradoEm() { return alteradoEm; }
    public void setAlteradoEm(LocalDateTime alteradoEm) { this.alteradoEm = alteradoEm; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNome() { return userNome; }
    public void setUserNome(String userNome) { this.userNome = userNome; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public BigDecimal getValorAnterior() { return valorAnterior; }
    public void setValorAnterior(BigDecimal valorAnterior) { this.valorAnterior = valorAnterior; }
    public BigDecimal getValorNovo() { return valorNovo; }
    public void setValorNovo(BigDecimal valorNovo) { this.valorNovo = valorNovo; }
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
}

