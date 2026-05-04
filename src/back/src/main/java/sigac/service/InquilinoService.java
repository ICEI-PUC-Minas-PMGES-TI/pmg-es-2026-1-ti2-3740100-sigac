package sigac.service;

import sigac.domain.Inquilino;
import sigac.dto.InquilinoDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.CondominioRepository;
import sigac.repository.InquilinoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InquilinoService {

    private final InquilinoRepository inquilinoRepository;
    private final CondominioRepository condominioRepository;
    private final CondominioAcessoService acessoService;

    public InquilinoService(InquilinoRepository inquilinoRepository, CondominioRepository condominioRepository, CondominioAcessoService acessoService) {
        this.inquilinoRepository = inquilinoRepository;
        this.condominioRepository = condominioRepository;
        this.acessoService = acessoService;
    }

    @Transactional
    public InquilinoDTO criar(Long condominioId, InquilinoDTO dto) {
        if (!acessoService.podeEditarCondominio(condominioId)) throw new ForbiddenException("Sem permissão");
        var condominio = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        Inquilino i = new Inquilino();
        i.setNome(dto.getNome());
        i.setEmail(dto.getEmail());
        i.setCondominio(condominio);
        i = inquilinoRepository.save(i);
        dto.setId(i.getId());
        dto.setCondominioId(condominioId);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<InquilinoDTO> listarPorCondominio(Long condominioId) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return inquilinoRepository.findByCondominioId(condominioId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public InquilinoDTO atualizar(Long id, InquilinoDTO dto) {
        Inquilino i = inquilinoRepository.findById(id).orElseThrow(() -> new NotFoundException("Inquilino não encontrado"));
        if (!acessoService.podeEditarCondominio(i.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        i.setNome(dto.getNome());
        i.setEmail(dto.getEmail());
        i = inquilinoRepository.save(i);
        return toDTO(i);
    }

    @Transactional
    public void excluir(Long id) {
        Inquilino i = inquilinoRepository.findById(id).orElseThrow(() -> new NotFoundException("Inquilino não encontrado"));
        if (!acessoService.podeEditarCondominio(i.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        inquilinoRepository.delete(i);
    }

    private InquilinoDTO toDTO(Inquilino i) {
        InquilinoDTO dto = new InquilinoDTO();
        dto.setId(i.getId());
        dto.setNome(i.getNome());
        dto.setEmail(i.getEmail());
        dto.setCondominioId(i.getCondominio().getId());
        return dto;
    }
}
