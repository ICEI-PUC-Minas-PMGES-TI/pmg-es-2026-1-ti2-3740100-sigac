package sigac.dto;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public class DashboardGastosDTO {
    private Long condominioId;
    private String nomeCondominio;
    private YearMonth mesAno;
    private BigDecimal totalFuncionarios;
    private BigDecimal totalProdutos;
    private BigDecimal totalManutencoes;
    private BigDecimal totalGeral;
    private List<ItemGastoDTO> itens;
    private List<ManutencaoResumoDTO> manutencoesDoMes;
    private List<FuncionarioResumoDTO> funcionarios;
    private List<GastoProdutoResumoDTO> gastosProdutosDoMes;

    public Long getCondominioId() { return condominioId; }
    public void setCondominioId(Long condominioId) { this.condominioId = condominioId; }
    public String getNomeCondominio() { return nomeCondominio; }
    public void setNomeCondominio(String nomeCondominio) { this.nomeCondominio = nomeCondominio; }
    public YearMonth getMesAno() { return mesAno; }
    public void setMesAno(YearMonth mesAno) { this.mesAno = mesAno; }
    public BigDecimal getTotalFuncionarios() { return totalFuncionarios; }
    public void setTotalFuncionarios(BigDecimal totalFuncionarios) { this.totalFuncionarios = totalFuncionarios; }
    public BigDecimal getTotalProdutos() { return totalProdutos; }
    public void setTotalProdutos(BigDecimal totalProdutos) { this.totalProdutos = totalProdutos; }
    public BigDecimal getTotalManutencoes() { return totalManutencoes; }
    public void setTotalManutencoes(BigDecimal totalManutencoes) { this.totalManutencoes = totalManutencoes; }
    public BigDecimal getTotalGeral() { return totalGeral; }
    public void setTotalGeral(BigDecimal totalGeral) { this.totalGeral = totalGeral; }
    public List<ItemGastoDTO> getItens() { return itens; }
    public void setItens(List<ItemGastoDTO> itens) { this.itens = itens; }
    public List<ManutencaoResumoDTO> getManutencoesDoMes() { return manutencoesDoMes; }
    public void setManutencoesDoMes(List<ManutencaoResumoDTO> manutencoesDoMes) { this.manutencoesDoMes = manutencoesDoMes; }
    public List<FuncionarioResumoDTO> getFuncionarios() { return funcionarios; }
    public void setFuncionarios(List<FuncionarioResumoDTO> funcionarios) { this.funcionarios = funcionarios; }
    public List<GastoProdutoResumoDTO> getGastosProdutosDoMes() { return gastosProdutosDoMes; }
    public void setGastosProdutosDoMes(List<GastoProdutoResumoDTO> gastosProdutosDoMes) { this.gastosProdutosDoMes = gastosProdutosDoMes; }
}
