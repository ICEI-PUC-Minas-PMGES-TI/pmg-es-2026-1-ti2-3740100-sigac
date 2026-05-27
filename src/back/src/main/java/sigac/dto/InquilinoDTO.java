package sigac.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InquilinoDTO {
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "Andar é obrigatório")
    private String andar;

    @NotBlank(message = "Apartamento é obrigatório")
    private String apartamento;

    private Long condominioId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAndar() { return andar; }
    public void setAndar(String andar) { this.andar = andar; }
    public String getApartamento() { return apartamento; }
    public void setApartamento(String apartamento) { this.apartamento = apartamento; }
    public Long getCondominioId() { return condominioId; }
    public void setCondominioId(Long condominioId) { this.condominioId = condominioId; }
}
