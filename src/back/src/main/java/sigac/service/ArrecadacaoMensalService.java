package sigac.service;

import sigac.domain.ArrecadacaoMensal;
import sigac.domain.ArrecadacaoMensalLog;
import sigac.domain.Condominio;
import sigac.dto.ArrecadacaoMensalDTO;
import sigac.dto.ArrecadacaoMensalLogDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.ArrecadacaoMensalLogRepository;
import sigac.repository.ArrecadacaoMensalRepository;
import sigac.repository.CondominioRepository;
import sigac.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArrecadacaoMensalService {

    private final ArrecadacaoMensalRepository arrecadacaoMensalRepository;
    private final ArrecadacaoMensalLogRepository arrecadacaoMensalLogRepository;
    private final CondominioRepository condominioRepository;
    private final CondominioAcessoService acessoService;

    public ArrecadacaoMensalService(ArrecadacaoMensalRepository arrecadacaoMensalRepository, ArrecadacaoMensalLogRepository arrecadacaoMensalLogRepository, CondominioRepository condominioRepository, CondominioAcessoService acessoService) {
        this.arrecadacaoMensalRepository = arrecadacaoMensalRepository;
        this.arrecadacaoMensalLogRepository = arrecadacaoMensalLogRepository;
        this.condominioRepository = condominioRepository;
        this.acessoService = acessoService;
    }

    @Transactional(readOnly = true)
    public ArrecadacaoMensalDTO obter(Long condominioId, int ano, int mes) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return arrecadacaoMensalRepository.findByCondominioIdAndAnoAndMes(condominioId, ano, mes)
                .map(this::toDto)
                .orElseGet(() -> {
                    ArrecadacaoMensalDTO dto = new ArrecadacaoMensalDTO();
                    dto.setCondominioId(condominioId);
                    dto.setAno(ano);
                    dto.setMes(mes);
                    dto.setValor(BigDecimal.ZERO);
                    return dto;
                });
    }

    /** Upsert do valor do mês (um único valor por mês/condomínio). */
    @Transactional
    public ArrecadacaoMensalDTO definir(Long condominioId, ArrecadacaoMensalDTO dto) {
        UserPrincipal u = CondominioAcessoService.getCurrentUser();
        if (u == null) throw new ForbiddenException("Sem permissão: usuário não autenticado");
        if (!acessoService.podeEditarCondominio(condominioId)) {
            throw new ForbiddenException("Sem permissão: role=" + u.getRole() + ", userId=" + u.getId() + ", condominioId=" + condominioId);
        }
        if (dto == null) throw new IllegalArgumentException("Informe os dados");
        if (dto.getAno() == null || dto.getMes() == null) throw new IllegalArgumentException("Período inválido");
        if (dto.getAno() < 2000 || dto.getAno() > 2100 || dto.getMes() < 1 || dto.getMes() > 12) {
            throw new IllegalArgumentException("Período inválido");
        }
        if (dto.getValor() == null || dto.getValor().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Valor inválido");
        }

        Condominio c = condominioRepository.findById(condominioId)
                .orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));

        ArrecadacaoMensal entity = arrecadacaoMensalRepository
                .findByCondominioIdAndAnoAndMes(condominioId, dto.getAno(), dto.getMes())
                .orElseGet(ArrecadacaoMensal::new);

        boolean isNovo = entity.getId() == null;
        BigDecimal valorAnterior = isNovo ? null : entity.getValor();
        if (!isNovo && valorAnterior != null && valorAnterior.compareTo(dto.getValor()) == 0) {
            return toDto(entity);
        }

        entity.setCondominio(c);
        entity.setAno(dto.getAno());
        entity.setMes(dto.getMes());
        entity.setValor(dto.getValor());

        ArrecadacaoMensal salvo = arrecadacaoMensalRepository.save(entity);
        registrarLog(salvo, valorAnterior, dto.getValor(), isNovo ? "CRIAR" : "ALTERAR");
        return toDto(salvo);
    }

    @Transactional(readOnly = true)
    public List<ArrecadacaoMensalLogDTO> listarLogs(Long condominioId, int ano, int mes) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return arrecadacaoMensalLogRepository
                .findByArrecadacaoMensalCondominioIdAndArrecadacaoMensalAnoAndArrecadacaoMensalMesOrderByAlteradoEmDesc(condominioId, ano, mes)
                .stream()
                .map(this::toLogDto)
                .collect(Collectors.toList());
    }

    private void registrarLog(ArrecadacaoMensal arrec, BigDecimal anterior, BigDecimal novo, String acao) {
        UserPrincipal u = CondominioAcessoService.getCurrentUser();
        ArrecadacaoMensalLog log = new ArrecadacaoMensalLog();
        log.setArrecadacaoMensal(arrec);
        log.setAlteradoEm(LocalDateTime.now());
        log.setUserId(u != null ? u.getId() : null);
        log.setUserNome(u != null ? u.getNome() : null);
        log.setUserEmail(u != null ? u.getEmail() : null);
        log.setValorAnterior(anterior);
        log.setValorNovo(novo);
        log.setAcao(acao);
        arrecadacaoMensalLogRepository.save(log);
    }

    private ArrecadacaoMensalDTO toDto(ArrecadacaoMensal a) {
        ArrecadacaoMensalDTO dto = new ArrecadacaoMensalDTO();
        dto.setId(a.getId());
        dto.setCondominioId(a.getCondominio() != null ? a.getCondominio().getId() : null);
        dto.setAno(a.getAno());
        dto.setMes(a.getMes());
        dto.setValor(a.getValor());
        return dto;
    }

    private ArrecadacaoMensalLogDTO toLogDto(ArrecadacaoMensalLog l) {
        ArrecadacaoMensalLogDTO dto = new ArrecadacaoMensalLogDTO();
        dto.setId(l.getId());
        dto.setAlteradoEm(l.getAlteradoEm());
        dto.setUserId(l.getUserId());
        dto.setUserNome(l.getUserNome());
        dto.setUserEmail(l.getUserEmail());
        dto.setValorAnterior(l.getValorAnterior());
        dto.setValorNovo(l.getValorNovo());
        dto.setAcao(l.getAcao());
        return dto;
    }
}

