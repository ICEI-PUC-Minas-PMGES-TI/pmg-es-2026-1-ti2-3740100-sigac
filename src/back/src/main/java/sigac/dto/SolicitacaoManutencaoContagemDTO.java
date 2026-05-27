package sigac.dto;

public class SolicitacaoManutencaoContagemDTO {
    private long total;

    public SolicitacaoManutencaoContagemDTO() {}

    public SolicitacaoManutencaoContagemDTO(long total) {
        this.total = total;
    }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
}
