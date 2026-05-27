package sigac.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

@Entity
@Table(name = "funcionarios")
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Column(nullable = false)
    private String funcao;

    @NotBlank
    @Email
    @Column(nullable = false)
    private String email;

    /** CPF apenas com dígitos (11). */
    @NotBlank
    @Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 dígitos.")
    @Column(nullable = false, length = 11)
    private String cpf;

    /** Telefone é opcional (apenas dígitos, DDD incluso). */
    @Column(length = 20)
    private String telefone;

    @NotNull
    @DecimalMin("0")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorMensal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominio_id", nullable = false)
    private Condominio condominio;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getFuncao() { return funcao; }
    public void setFuncao(String funcao) { this.funcao = funcao; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public BigDecimal getValorMensal() { return valorMensal; }
    public void setValorMensal(BigDecimal valorMensal) { this.valorMensal = valorMensal; }
    public Condominio getCondominio() { return condominio; }
    public void setCondominio(Condominio condominio) { this.condominio = condominio; }
}
