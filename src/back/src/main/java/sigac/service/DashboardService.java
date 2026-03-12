package sigac.service;

import sigac.domain.Condominio;
import sigac.domain.Funcionario;
import sigac.domain.GastoProduto;
import sigac.domain.Manutencao;
import sigac.dto.*;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.CondominioRepository;
import sigac.repository.FuncionarioRepository;
import sigac.repository.GastoProdutoRepository;
import sigac.repository.ManutencaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CondominioRepository condominioRepository;

    public DashboardService(CondominioRepository condominioRepository, FuncionarioRepository funcionarioRepository, GastoProdutoRepository gastoProdutoRepository, ManutencaoRepository manutencaoRepository, CondominioAcessoService acessoService) {
        this.condominioRepository = condominioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.gastoProdutoRepository = gastoProdutoRepository;
        this.manutencaoRepository = manutencaoRepository;
        this.acessoService = acessoService;
    }

    private final FuncionarioRepository funcionarioRepository;
    private final GastoProdutoRepository gastoProdutoRepository;
    private final ManutencaoRepository manutencaoRepository;
    private final CondominioAcessoService acessoService;

    /**
     * Relatório completo de gastos mensais: funcionários (valor mensal fixo) + produtos + manutenções do mês.
     */
    @Transactional(readOnly = true)
    public DashboardGastosDTO relatorioGastosMensais(Long condominioId, int ano, int mes) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        Condominio c = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        YearMonth ym = YearMonth.of(ano, mes);
        LocalDate inicio = ym.atDay(1);
        LocalDate fim = ym.atEndOfMonth();

        BigDecimal totalFunc = funcionarioRepository.findByCondominioId(condominioId).stream()
                .map(Funcionario::getValorMensal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProd = gastoProdutoRepository.findByCondominioIdAndDataBetween(condominioId, inicio, fim).stream()
                .map(GastoProduto::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalMan = manutencaoRepository.findByCondominioIdAndDataBetween(condominioId, inicio, fim).stream()
                .map(Manutencao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalGeral = totalFunc.add(totalProd).add(totalMan);

        List<ItemGastoDTO> itens = new ArrayList<>();
        ItemGastoDTO i1 = new ItemGastoDTO(); i1.setCategoria("Funcionários"); i1.setValor(totalFunc); itens.add(i1);
        ItemGastoDTO i2 = new ItemGastoDTO(); i2.setCategoria("Produtos"); i2.setValor(totalProd); itens.add(i2);
        ItemGastoDTO i3 = new ItemGastoDTO(); i3.setCategoria("Manutenções"); i3.setValor(totalMan); itens.add(i3);

        List<Manutencao> manutencoesMes = manutencaoRepository.findByCondominioIdAndDataBetween(condominioId, inicio, fim);
        List<ManutencaoResumoDTO> manutencoesDoMes = manutencoesMes.stream().map(this::toManutencaoResumo).collect(Collectors.toList());

        List<Funcionario> funcionariosList = funcionarioRepository.findByCondominioId(condominioId);
        List<FuncionarioResumoDTO> funcionariosDto = funcionariosList.stream().map(this::toFuncionarioResumo).collect(Collectors.toList());

        List<GastoProduto> gastosMes = gastoProdutoRepository.findByCondominioIdAndDataBetween(condominioId, inicio, fim);
        List<GastoProdutoResumoDTO> gastosProdutosDoMes = gastosMes.stream().map(this::toGastoProdutoResumo).collect(Collectors.toList());

        DashboardGastosDTO dto = new DashboardGastosDTO();
        dto.setCondominioId(c.getId());
        dto.setNomeCondominio(c.getNome());
        dto.setMesAno(ym);
        dto.setTotalFuncionarios(totalFunc);
        dto.setTotalProdutos(totalProd);
        dto.setTotalManutencoes(totalMan);
        dto.setTotalGeral(totalGeral);
        dto.setItens(itens);
        dto.setManutencoesDoMes(manutencoesDoMes);
        dto.setFuncionarios(funcionariosDto);
        dto.setGastosProdutosDoMes(gastosProdutosDoMes);
        return dto;
    }

    private ManutencaoResumoDTO toManutencaoResumo(Manutencao m) {
        ManutencaoResumoDTO d = new ManutencaoResumoDTO();
        d.setId(m.getId());
        d.setDescricao(m.getDescricao());
        d.setData(m.getData());
        d.setValor(m.getValor());
        d.setTipo(m.getTipo());
        d.setPrestador(m.getPrestador());
        return d;
    }

    private FuncionarioResumoDTO toFuncionarioResumo(Funcionario f) {
        FuncionarioResumoDTO d = new FuncionarioResumoDTO();
        d.setId(f.getId());
        d.setNome(f.getNome());
        d.setFuncao(f.getFuncao());
        d.setValorMensal(f.getValorMensal());
        return d;
    }

    private GastoProdutoResumoDTO toGastoProdutoResumo(GastoProduto g) {
        GastoProdutoResumoDTO d = new GastoProdutoResumoDTO();
        d.setId(g.getId());
        d.setDescricao(g.getDescricao());
        d.setValor(g.getValor());
        d.setData(g.getData());
        d.setLojaFornecedor(g.getLojaFornecedor());
        return d;
    }
}
