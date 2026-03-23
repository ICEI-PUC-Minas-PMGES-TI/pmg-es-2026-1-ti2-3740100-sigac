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
import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CondominioRepository condominioRepository;
    private final EmailService emailService;

    public DashboardService(
            CondominioRepository condominioRepository,
            EmailService emailService,
            FuncionarioRepository funcionarioRepository,
            GastoProdutoRepository gastoProdutoRepository,
            ManutencaoRepository manutencaoRepository,
            CondominioAcessoService acessoService) {
        this.condominioRepository = condominioRepository;
        this.emailService = emailService;
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

    private static final int MAX_DESTINATARIOS_RELATORIO = 40;

    /**
     * Envia por e-mail o PDF do relatório (gerado no front) para um ou mais destinatários.
     *
     * @return quantidade de destinatários após normalização (deduplicação)
     */
    public int enviarRelatorioPorEmail(Long condominioId, List<String> destinatarios, int ano, int mes, byte[] pdfBytes, String nomeArquivoOriginal) throws MessagingException {
        if (!acessoService.podeEditarCondominio(condominioId)) throw new ForbiddenException("Sem permissão para enviar relatório");
        if (destinatarios == null || destinatarios.isEmpty()) throw new IllegalArgumentException("Informe ao menos um e-mail de destino");
        LinkedHashSet<String> unicos = new LinkedHashSet<>();
        for (String s : destinatarios) {
            if (s == null) continue;
            String t = s.trim();
            if (!t.isEmpty()) unicos.add(t);
        }
        if (unicos.isEmpty()) throw new IllegalArgumentException("Informe ao menos um e-mail de destino");
        if (unicos.size() > MAX_DESTINATARIOS_RELATORIO) {
            throw new IllegalArgumentException("Máximo de " + MAX_DESTINATARIOS_RELATORIO + " destinatários por envio");
        }
        List<String> lista = new ArrayList<>(unicos);
        if (ano < 2000 || ano > 2100 || mes < 1 || mes > 12) throw new IllegalArgumentException("Período inválido");
        if (pdfBytes == null || pdfBytes.length < 8) throw new IllegalArgumentException("Arquivo PDF inválido ou vazio");
        if (pdfBytes[0] != '%' || pdfBytes[1] != 'P' || pdfBytes[2] != 'D' || pdfBytes[3] != 'F') {
            throw new IllegalArgumentException("O anexo deve ser um arquivo PDF");
        }
        if (pdfBytes.length > 15 * 1024 * 1024) throw new IllegalArgumentException("Arquivo muito grande (máx. 15 MB)");

        DashboardGastosDTO dash = relatorioGastosMensais(condominioId, ano, mes);
        String periodoLegivel = Month.of(mes).getDisplayName(TextStyle.FULL_STANDALONE, new Locale("pt", "BR")) + " de " + ano;
        NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR"));
        String totalFmt = nf.format(dash.getTotalGeral());

        String nomeAnexo = nomeArquivoOriginal != null ? nomeArquivoOriginal.trim() : "";
        if (nomeAnexo.isEmpty()) nomeAnexo = "relatorio-gastos.pdf";
        nomeAnexo = nomeAnexo.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (!nomeAnexo.toLowerCase(Locale.ROOT).endsWith(".pdf")) nomeAnexo = nomeAnexo + ".pdf";

        emailService.enviarRelatorioGastosPdf(
                lista,
                dash.getNomeCondominio(),
                periodoLegivel,
                totalFmt,
                pdfBytes,
                nomeAnexo
        );
        return lista.size();
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
