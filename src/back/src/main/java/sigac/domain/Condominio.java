package sigac.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "condominios")
public class Condominio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    private String endereco;

    private String cnpj;

    @OneToMany(mappedBy = "condominio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GestorCondominio> gestores = new ArrayList<>();

    @OneToMany(mappedBy = "condominio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SindicoCondominio> sindicos = new ArrayList<>();

    @OneToMany(mappedBy = "condominio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Funcionario> funcionarios = new ArrayList<>();

    @OneToMany(mappedBy = "condominio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Inquilino> inquilinos = new ArrayList<>();

    @OneToMany(mappedBy = "condominio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GastoProduto> gastosProdutos = new ArrayList<>();

    @OneToMany(mappedBy = "condominio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Manutencao> manutencoes = new ArrayList<>();

    @OneToMany(mappedBy = "condominio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ArrecadacaoMensal> arrecadacoesMensais = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public List<GestorCondominio> getGestores() { return gestores; }
    public void setGestores(List<GestorCondominio> gestores) { this.gestores = gestores; }
    public List<SindicoCondominio> getSindicos() { return sindicos; }
    public void setSindicos(List<SindicoCondominio> sindicos) { this.sindicos = sindicos; }
    public List<Funcionario> getFuncionarios() { return funcionarios; }
    public void setFuncionarios(List<Funcionario> funcionarios) { this.funcionarios = funcionarios; }
    public List<Inquilino> getInquilinos() { return inquilinos; }
    public void setInquilinos(List<Inquilino> inquilinos) { this.inquilinos = inquilinos; }
    public List<GastoProduto> getGastosProdutos() { return gastosProdutos; }
    public void setGastosProdutos(List<GastoProduto> gastosProdutos) { this.gastosProdutos = gastosProdutos; }
    public List<Manutencao> getManutencoes() { return manutencoes; }
    public void setManutencoes(List<Manutencao> manutencoes) { this.manutencoes = manutencoes; }
    public List<ArrecadacaoMensal> getArrecadacoesMensais() { return arrecadacoesMensais; }
    public void setArrecadacoesMensais(List<ArrecadacaoMensal> arrecadacoesMensais) { this.arrecadacoesMensais = arrecadacoesMensais; }
}
