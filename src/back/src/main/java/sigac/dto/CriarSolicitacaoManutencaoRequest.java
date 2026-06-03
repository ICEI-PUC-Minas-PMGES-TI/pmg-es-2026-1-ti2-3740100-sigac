package sigac.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import sigac.domain.CategoriaManutencao;

public class CriarSolicitacaoManutencaoRequest {

    @NotBlank(message = "Informe o que deve ser arrumado")
    @Size(max = 500)
    private String titulo;

    @NotNull(message = "Selecione a categoria da manutenção")
    private CategoriaManutencao categoria;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public CategoriaManutencao getCategoria() { return categoria; }
    public void setCategoria(CategoriaManutencao categoria) { this.categoria = categoria; }
}
