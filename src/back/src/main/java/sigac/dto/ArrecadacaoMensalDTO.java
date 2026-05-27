package sigac.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ArrecadacaoMensalDTO {
    private Long id;

    @NotNull
    @Min(2000)
    @Max(2100)
    private Integer ano;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer mes;

    @NotNull
    @DecimalMin("0")
    private BigDecimal valor;

    private Long condominioId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public Long getCondominioId() { return condominioId; }
    public void setCondominioId(Long condominioId) { this.condominioId = condominioId; }
}

