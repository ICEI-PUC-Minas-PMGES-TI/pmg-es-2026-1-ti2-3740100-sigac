package sigac.dto;

import sigac.domain.TipoManutencao;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ManutencaoDTO {
    private Long id;
    private String descricao;
    private BigDecimal valor;
    private LocalDate data;
    private TipoManutencao tipo;
    private String prestador;
    private String instrucoesEmail;
    private Long condominioId;
    /** Ao cadastrar a partir de uma solicitação do síndico, enviar o id para remover a fila após criar. */
    private Long solicitacaoId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public TipoManutencao getTipo() { return tipo; }
    public void setTipo(TipoManutencao tipo) { this.tipo = tipo; }
    public String getPrestador() { return prestador; }
    public void setPrestador(String prestador) { this.prestador = prestador; }
    public Long getCondominioId() { return condominioId; }
    public void setCondominioId(Long condominioId) { this.condominioId = condominioId; }
    public String getInstrucoesEmail() { return instrucoesEmail; }
    public void setInstrucoesEmail(String instrucoesEmail) { this.instrucoesEmail = instrucoesEmail; }
    public Long getSolicitacaoId() { return solicitacaoId; }
    public void setSolicitacaoId(Long solicitacaoId) { this.solicitacaoId = solicitacaoId; }
}
