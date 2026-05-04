package sigac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CriarSolicitacaoManutencaoRequest {

    @NotBlank(message = "Informe o que deve ser arrumado")
    @Size(max = 500)
    private String titulo;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
}
