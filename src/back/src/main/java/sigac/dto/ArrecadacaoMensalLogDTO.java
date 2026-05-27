package sigac.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ArrecadacaoMensalLogDTO {
    private Long id;
    private LocalDateTime alteradoEm;
    private Long userId;
    private String userNome;
    private String userEmail;
    private BigDecimal valorAnterior;
    private BigDecimal valorNovo;
    private String acao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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

