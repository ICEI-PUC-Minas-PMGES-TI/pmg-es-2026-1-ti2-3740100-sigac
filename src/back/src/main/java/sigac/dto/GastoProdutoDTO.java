package sigac.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class GastoProdutoDTO {
    private Long id;
    private String descricao;
    private BigDecimal valor;
    private LocalDate data;
    private String lojaFornecedor;
    private Long condominioId;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getLojaFornecedor() { return lojaFornecedor; }
    public void setLojaFornecedor(String lojaFornecedor) { this.lojaFornecedor = lojaFornecedor; }
    public Long getCondominioId() { return condominioId; }
    public void setCondominioId(Long condominioId) { this.condominioId = condominioId; }
}
