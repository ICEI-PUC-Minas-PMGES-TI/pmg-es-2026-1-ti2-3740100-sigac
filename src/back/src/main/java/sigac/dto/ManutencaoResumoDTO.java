package sigac.dto;

import sigac.domain.CategoriaManutencao;
import sigac.domain.TipoManutencao;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ManutencaoResumoDTO {
    private Long id;
    private String descricao;
    private LocalDate data;
    private BigDecimal valor;
    private TipoManutencao tipo;
    private CategoriaManutencao categoria;
    private String prestador;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public TipoManutencao getTipo() { return tipo; }
    public void setTipo(TipoManutencao tipo) { this.tipo = tipo; }
    public CategoriaManutencao getCategoria() { return categoria; }
    public void setCategoria(CategoriaManutencao categoria) { this.categoria = categoria; }
    public String getPrestador() { return prestador; }
    public void setPrestador(String prestador) { this.prestador = prestador; }
}
