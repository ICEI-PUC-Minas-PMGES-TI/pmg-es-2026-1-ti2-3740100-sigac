package sigac.service;

import sigac.domain.Manutencao;
import sigac.dto.ManutencaoDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.domain.SolicitacaoManutencao;
import sigac.repository.CondominioRepository;
import sigac.repository.ManutencaoRepository;
import sigac.repository.SolicitacaoManutencaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ManutencaoService {

    private final ManutencaoRepository manutencaoRepository;
    private final CondominioRepository condominioRepository;
    private final SolicitacaoManutencaoRepository solicitacaoManutencaoRepository;
    private final CondominioAcessoService acessoService;
    private final EmailService emailService;
    private final AvisoService avisoService;

    public ManutencaoService(
            ManutencaoRepository manutencaoRepository,
            CondominioRepository condominioRepository,
            SolicitacaoManutencaoRepository solicitacaoManutencaoRepository,
            CondominioAcessoService acessoService,
            EmailService emailService,
            AvisoService avisoService) {
        this.manutencaoRepository = manutencaoRepository;
        this.condominioRepository = condominioRepository;
        this.solicitacaoManutencaoRepository = solicitacaoManutencaoRepository;
        this.acessoService = acessoService;
        this.emailService = emailService;
        this.avisoService = avisoService;
    }

    @Transactional
    public ManutencaoDTO criar(Long condominioId, ManutencaoDTO dto) {
        if (!acessoService.podeEditarCondominio(condominioId)) throw new ForbiddenException("Sem permissão");
        SolicitacaoManutencao solicitacao = null;
        if (dto.getSolicitacaoId() != null) {
            solicitacao = solicitacaoManutencaoRepository.findByIdAndCondominioId(dto.getSolicitacaoId(), condominioId)
                    .orElseThrow(() -> new NotFoundException("Solicitação não encontrada neste condomínio"));
        }
        var condominio = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        Manutencao m = new Manutencao();
        m.setDescricao(dto.getDescricao());
        m.setValor(dto.getValor());
        m.setData(dto.getData());
        m.setTipo(dto.getTipo());
        m.setPrestador(dto.getPrestador());
        m.setInstrucoesEmail(dto.getInstrucoesEmail());
        m.setCondominio(condominio);
        m = manutencaoRepository.save(m);
        if (solicitacao != null) {
            solicitacaoManutencaoRepository.delete(solicitacao);
        }
        avisoService.registrarOuAtualizarAvisoDeManutencao(m);
        emailService.enviarNotificacaoManutencao(m, condominio.getNome());
        dto.setId(m.getId());
        dto.setCondominioId(condominioId);
        dto.setSolicitacaoId(null);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ManutencaoDTO> listarPorCondominio(Long condominioId) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return manutencaoRepository.findByCondominioId(condominioId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ManutencaoDTO buscarPorId(Long id) {
        Manutencao m = manutencaoRepository.findById(id).orElseThrow(() -> new NotFoundException("Manutenção não encontrada"));
        if (!acessoService.podeAcessarCondominio(m.getCondominio().getId())) throw new ForbiddenException("Sem acesso");
        return toDTO(m);
    }

    @Transactional
    public ManutencaoDTO atualizar(Long id, ManutencaoDTO dto, boolean notificar) {
        Manutencao m = manutencaoRepository.findById(id).orElseThrow(() -> new NotFoundException("Manutenção não encontrada"));
        if (!acessoService.podeEditarCondominio(m.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        m.setDescricao(dto.getDescricao());
        m.setValor(dto.getValor());
        m.setData(dto.getData());
        m.setTipo(dto.getTipo());
        m.setPrestador(dto.getPrestador());
        m.setInstrucoesEmail(dto.getInstrucoesEmail());
        m = manutencaoRepository.save(m);
        avisoService.registrarOuAtualizarAvisoDeManutencao(m);
        if (notificar) {
            emailService.enviarNotificacaoAlteracaoManutencao(m, m.getCondominio().getNome());
        }
        return toDTO(m);
    }

    @Transactional
    public void excluir(Long id) {
        Manutencao m = manutencaoRepository.findById(id).orElseThrow(() -> new NotFoundException("Manutenção não encontrada"));
        if (!acessoService.podeEditarCondominio(m.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        manutencaoRepository.delete(m);
    }

    private ManutencaoDTO toDTO(Manutencao m) {
        ManutencaoDTO dto = new ManutencaoDTO();
        dto.setId(m.getId());
        dto.setDescricao(m.getDescricao());
        dto.setValor(m.getValor());
        dto.setData(m.getData());
        dto.setTipo(m.getTipo());
        dto.setPrestador(m.getPrestador());
        dto.setInstrucoesEmail(m.getInstrucoesEmail());
        dto.setCondominioId(m.getCondominio().getId());
        return dto;
    }
}
