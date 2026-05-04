package sigac.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sigac.domain.AlcanceAviso;
import sigac.domain.Aviso;
import sigac.domain.AvisoDestinatario;
import sigac.domain.Inquilino;
import sigac.domain.Manutencao;
import sigac.domain.OrigemAviso;
import sigac.dto.AvisoDTO;
import sigac.dto.AvisoDestinatarioDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.AvisoRepository;
import sigac.repository.CondominioRepository;
import sigac.repository.InquilinoRepository;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AvisoService {

    private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final AvisoRepository avisoRepository;
    private final CondominioRepository condominioRepository;
    private final InquilinoRepository inquilinoRepository;
    private final CondominioAcessoService acessoService;
    private final EmailService emailService;

    public AvisoService(
            AvisoRepository avisoRepository,
            CondominioRepository condominioRepository,
            InquilinoRepository inquilinoRepository,
            CondominioAcessoService acessoService,
            EmailService emailService) {
        this.avisoRepository = avisoRepository;
        this.condominioRepository = condominioRepository;
        this.inquilinoRepository = inquilinoRepository;
        this.acessoService = acessoService;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<AvisoDTO> listarPorCondominio(Long condominioId) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return avisoRepository.findByCondominioIdOrderByCriadoEmDescIdDesc(condominioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AvisoDTO criarManual(Long condominioId, AvisoDTO dto) {
        if (!acessoService.podeEditarCondominio(condominioId)) throw new ForbiddenException("Sem permissão");
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new IllegalArgumentException("Informe o título do aviso.");
        }
        if (dto.getMensagem() == null || dto.getMensagem().isBlank()) {
            throw new IllegalArgumentException("Informe a mensagem do aviso.");
        }
        if (dto.getDataReferencia() == null) {
            throw new IllegalArgumentException("Informe a data de referência do aviso.");
        }

        var condominio = condominioRepository.findById(condominioId)
                .orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        AlcanceAviso alcance = dto.getAlcance() != null ? dto.getAlcance() : AlcanceAviso.TODOS;
        List<Inquilino> destinatarios = resolverDestinatarios(condominioId, alcance, dto.getDestinatarios());

        Aviso aviso = new Aviso();
        aviso.setTitulo(dto.getTitulo().trim());
        aviso.setMensagem(dto.getMensagem().trim());
        aviso.setDataReferencia(dto.getDataReferencia());
        aviso.setOrigem(OrigemAviso.GERAL);
        aviso.setAlcance(alcance);
        aviso.setCondominio(condominio);
        preencherDestinatariosSnapshot(aviso, destinatarios, alcance);

        aviso = avisoRepository.save(aviso);
        emailService.enviarAvisoGeral(aviso, condominio.getNome(), toEmailDestinatarios(destinatarios));
        return toDTO(aviso);
    }

    @Transactional
    public void registrarOuAtualizarAvisoDeManutencao(Manutencao manutencao) {
        Aviso aviso = avisoRepository.findByManutencaoIdOrigemAndCondominioId(
                        manutencao.getId(),
                        manutencao.getCondominio().getId())
                .orElseGet(Aviso::new);

        aviso.setTitulo("Manutenção programada");
        aviso.setMensagem(montarMensagemManutencao(manutencao));
        aviso.setDataReferencia(manutencao.getData());
        aviso.setOrigem(OrigemAviso.MANUTENCAO);
        aviso.setAlcance(AlcanceAviso.TODOS);
        aviso.setManutencaoIdOrigem(manutencao.getId());
        aviso.setCondominio(manutencao.getCondominio());
        aviso.clearDestinatarios();

        avisoRepository.save(aviso);
    }

    private List<Inquilino> resolverDestinatarios(Long condominioId, AlcanceAviso alcance, List<AvisoDestinatarioDTO> destinatarios) {
        if (alcance == AlcanceAviso.TODOS) {
            return inquilinoRepository.findByCondominioId(condominioId);
        }

        List<Long> ids = (destinatarios == null ? List.<AvisoDestinatarioDTO>of() : destinatarios).stream()
                .map(AvisoDestinatarioDTO::getInquilinoId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        if (ids.isEmpty()) {
            throw new IllegalArgumentException("Selecione ao menos um inquilino para enviar o aviso específico.");
        }

        List<Inquilino> encontrados = inquilinoRepository.findByCondominioIdAndIdIn(condominioId, ids);
        Map<Long, Inquilino> porId = encontrados.stream()
                .collect(Collectors.toMap(Inquilino::getId, i -> i, (a, b) -> a, LinkedHashMap::new));

        List<Long> faltantes = ids.stream()
                .filter(id -> !porId.containsKey(id))
                .collect(Collectors.toList());
        if (!faltantes.isEmpty()) {
            throw new NotFoundException("Alguns inquilinos selecionados não foram encontrados neste condomínio.");
        }

        List<Inquilino> ordenados = new ArrayList<>();
        for (Long id : ids) {
            ordenados.add(porId.get(id));
        }
        return ordenados;
    }

    private void preencherDestinatariosSnapshot(Aviso aviso, List<Inquilino> destinatarios, AlcanceAviso alcance) {
        aviso.clearDestinatarios();
        if (alcance != AlcanceAviso.ESPECIFICOS) return;
        for (Inquilino inquilino : destinatarios) {
            AvisoDestinatario destinatario = new AvisoDestinatario();
            destinatario.setInquilinoId(inquilino.getId());
            destinatario.setNome(inquilino.getNome());
            destinatario.setEmail(inquilino.getEmail());
            aviso.addDestinatario(destinatario);
        }
    }

    private List<EmailService.EmailDestinatario> toEmailDestinatarios(List<Inquilino> destinatarios) {
        return destinatarios.stream()
                .sorted(Comparator.comparing(Inquilino::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(i -> new EmailService.EmailDestinatario(i.getNome(), i.getEmail()))
                .collect(Collectors.toList());
    }

    private String montarMensagemManutencao(Manutencao manutencao) {
        StringBuilder sb = new StringBuilder();
        sb.append("Está programada uma manutenção ")
                .append(manutencao.getTipo() == null ? "no condomínio" : manutencao.getTipo().name().toLowerCase())
                .append(" para o dia ")
                .append(manutencao.getData().format(DATA_BR))
                .append(": ")
                .append(manutencao.getDescricao())
                .append(".");

        if (manutencao.getPrestador() != null && !manutencao.getPrestador().isBlank()) {
            sb.append(" Prestador: ").append(manutencao.getPrestador().trim()).append(".");
        }
        if (manutencao.getInstrucoesEmail() != null && !manutencao.getInstrucoesEmail().isBlank()) {
            sb.append(" Orientações: ").append(manutencao.getInstrucoesEmail().trim());
        }
        return sb.toString();
    }

    private AvisoDTO toDTO(Aviso aviso) {
        AvisoDTO dto = new AvisoDTO();
        dto.setId(aviso.getId());
        dto.setTitulo(aviso.getTitulo());
        dto.setMensagem(aviso.getMensagem());
        dto.setDataReferencia(aviso.getDataReferencia());
        dto.setOrigem(aviso.getOrigem());
        dto.setAlcance(aviso.getAlcance());
        dto.setManutencaoIdOrigem(aviso.getManutencaoIdOrigem());
        dto.setCondominioId(aviso.getCondominio().getId());
        dto.setCriadoEm(aviso.getCriadoEm());
        dto.setDestinatarios(aviso.getDestinatarios().stream()
                .map(destinatario -> {
                    AvisoDestinatarioDTO destinatarioDTO = new AvisoDestinatarioDTO();
                    destinatarioDTO.setInquilinoId(destinatario.getInquilinoId());
                    destinatarioDTO.setNome(destinatario.getNome());
                    destinatarioDTO.setEmail(destinatario.getEmail());
                    return destinatarioDTO;
                })
                .collect(Collectors.toList()));
        return dto;
    }
}
