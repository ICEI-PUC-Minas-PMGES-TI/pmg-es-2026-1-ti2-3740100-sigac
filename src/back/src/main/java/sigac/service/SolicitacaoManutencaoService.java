package sigac.service;

import sigac.domain.SolicitacaoManutencao;
import sigac.dto.CriarSolicitacaoManutencaoRequest;
import sigac.dto.SolicitacaoManutencaoContagemDTO;
import sigac.dto.SolicitacaoManutencaoDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.CondominioRepository;
import sigac.repository.SolicitacaoManutencaoRepository;
import sigac.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SolicitacaoManutencaoService {

    private final SolicitacaoManutencaoRepository solicitacaoRepository;
    private final CondominioRepository condominioRepository;
    private final UserRepository userRepository;
    private final CondominioAcessoService acessoService;

    public SolicitacaoManutencaoService(
            SolicitacaoManutencaoRepository solicitacaoRepository,
            CondominioRepository condominioRepository,
            UserRepository userRepository,
            CondominioAcessoService acessoService) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.condominioRepository = condominioRepository;
        this.userRepository = userRepository;
        this.acessoService = acessoService;
    }

    @Transactional
    public SolicitacaoManutencaoDTO criar(Long condominioId, CriarSolicitacaoManutencaoRequest request) {
        if (!acessoService.podeSolicitarManutencao(condominioId)) {
            throw new ForbiddenException("Apenas o síndico deste condomínio pode solicitar manutenção");
        }
        var principal = CondominioAcessoService.getCurrentUser();
        var condominio = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        var user = userRepository.findById(principal.getId()).orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        SolicitacaoManutencao s = new SolicitacaoManutencao();
        s.setCondominio(condominio);
        s.setTitulo(request.getTitulo().trim());
        s.setSolicitante(user);
        s = solicitacaoRepository.save(s);
        return toDTO(s);
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoManutencaoDTO> listar(Long condominioId) {
        if (!acessoService.podeEditarCondominio(condominioId)) {
            throw new ForbiddenException("Sem permissão para ver solicitações");
        }
        return solicitacaoRepository.findByCondominioIdOrderByCriadoEmDesc(condominioId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SolicitacaoManutencaoContagemDTO contar(Long condominioId) {
        if (!acessoService.podeEditarCondominio(condominioId)) {
            throw new ForbiddenException("Sem permissão");
        }
        return new SolicitacaoManutencaoContagemDTO(solicitacaoRepository.countByCondominioId(condominioId));
    }

    @Transactional
    public void reprovar(Long condominioId, Long solicitacaoId) {
        if (!acessoService.podeEditarCondominio(condominioId)) {
            throw new ForbiddenException("Sem permissão");
        }
        var s = solicitacaoRepository.findByIdAndCondominioId(solicitacaoId, condominioId)
                .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));
        solicitacaoRepository.delete(s);
    }

    private SolicitacaoManutencaoDTO toDTO(SolicitacaoManutencao s) {
        SolicitacaoManutencaoDTO dto = new SolicitacaoManutencaoDTO();
        dto.setId(s.getId());
        dto.setTitulo(s.getTitulo());
        dto.setCondominioId(s.getCondominio().getId());
        dto.setSolicitanteNome(s.getSolicitante().getNome());
        dto.setCriadoEm(s.getCriadoEm().toString());
        return dto;
    }
}
