package sigac.dto;

import java.math.BigDecimal;

public class ItemGastoDTO {
    private String categoria;
    private BigDecimal valor;
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}
