package sigac.dto;

import sigac.domain.AlcanceAviso;
import sigac.domain.OrigemAviso;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AvisoDTO {
    private Long id;
    private String titulo;
    private String mensagem;
    private LocalDate dataReferencia;
    private OrigemAviso origem;
    private AlcanceAviso alcance;
    private Long manutencaoIdOrigem;
    private Long condominioId;
    private LocalDateTime criadoEm;
    private List<AvisoDestinatarioDTO> destinatarios = new ArrayList<>();

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
    public Long getCondominioId() { return condominioId; }
    public void setCondominioId(Long condominioId) { this.condominioId = condominioId; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public List<AvisoDestinatarioDTO> getDestinatarios() { return destinatarios; }
    public void setDestinatarios(List<AvisoDestinatarioDTO> destinatarios) {
        this.destinatarios = destinatarios != null ? destinatarios : new ArrayList<>();
    }
}
