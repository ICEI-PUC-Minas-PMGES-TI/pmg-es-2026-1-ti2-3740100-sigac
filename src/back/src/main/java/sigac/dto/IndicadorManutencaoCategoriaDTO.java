package sigac.dto;

import sigac.domain.CategoriaManutencao;

import java.math.BigDecimal;

public class IndicadorManutencaoCategoriaDTO {
    private CategoriaManutencao categoria;
    private long quantidade;
    private BigDecimal valorTotal;

    public CategoriaManutencao getCategoria() { return categoria; }
    public void setCategoria(CategoriaManutencao categoria) { this.categoria = categoria; }
    public long getQuantidade() { return quantidade; }
    public void setQuantidade(long quantidade) { this.quantidade = quantidade; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
}
