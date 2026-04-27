package sigac.dto;

import jakarta.validation.constraints.Pattern;

public class CondominioDTO {
    private Long id;
    private String nome;
    private String endereco;

    /**
     * Pode ser numérico (legado) ou alfanumérico (nova norma).
     * A normalização/validação final (14 caracteres alfanuméricos) é aplicada no service.
     */
    @Pattern(
            regexp = "^[0-9A-Za-z.\\-/\\s]*$",
            message = "CNPJ deve conter apenas letras e números (pontuação opcional)."
    )
    private String cnpj;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
}
