package sigac.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "avisos")
public class Aviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 160)
    private String titulo;

    @NotBlank
    @Column(nullable = false, length = 2000)
    private String mensagem;

    @NotNull
    @Column(name = "data_referencia", nullable = false)
    private LocalDate dataReferencia;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrigemAviso origem;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlcanceAviso alcance;

    @Column(name = "manutencao_id_origem")
    private Long manutencaoIdOrigem;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominio_id", nullable = false)
    private Condominio condominio;

    @OneToMany(mappedBy = "aviso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvisoDestinatario> destinatarios = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public void addDestinatario(AvisoDestinatario destinatario) {
        destinatarios.add(destinatario);
        destinatario.setAviso(this);
    }

    public void clearDestinatarios() {
        destinatarios.clear();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public LocalDate getDataReferencia() { return dataReferencia; }
    public void setDataReferencia(LocalDate dataReferencia) { this.dataReferencia = dataReferencia; }
    public OrigemAviso getOrigem() { return origem; }
    public void setOrigem(OrigemAviso origem) { this.origem = origem; }
    public AlcanceAviso getAlcance() { return alcance; }
    public void setAlcance(AlcanceAviso alcance) { this.alcance = alcance; }
    public Long getManutencaoIdOrigem() { return manutencaoIdOrigem; }
    public void setManutencaoIdOrigem(Long manutencaoIdOrigem) { this.manutencaoIdOrigem = manutencaoIdOrigem; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public Condominio getCondominio() { return condominio; }
    public void setCondominio(Condominio condominio) { this.condominio = condominio; }
    public List<AvisoDestinatario> getDestinatarios() { return destinatarios; }
    public void setDestinatarios(List<AvisoDestinatario> destinatarios) { this.destinatarios = destinatarios; }
}
