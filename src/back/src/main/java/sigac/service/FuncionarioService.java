package sigac.service;

import sigac.domain.Funcionario;
import sigac.dto.FuncionarioDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.CondominioRepository;
import sigac.repository.FuncionarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final CondominioRepository condominioRepository;
    private final CondominioAcessoService acessoService;

    public FuncionarioService(FuncionarioRepository funcionarioRepository, CondominioRepository condominioRepository, CondominioAcessoService acessoService) {
        this.funcionarioRepository = funcionarioRepository;
        this.condominioRepository = condominioRepository;
        this.acessoService = acessoService;
    }

    @Transactional
    public FuncionarioDTO criar(Long condominioId, FuncionarioDTO dto) {
        if (!acessoService.podeEditarCondominio(condominioId)) throw new ForbiddenException("Sem permissão");
        var condominio = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        Funcionario f = new Funcionario();
        f.setNome(dto.getNome());
        f.setFuncao(dto.getFuncao());
        f.setValorMensal(dto.getValorMensal());
        f.setCondominio(condominio);
        f = funcionarioRepository.save(f);
        dto.setId(f.getId());
        dto.setCondominioId(condominioId);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDTO> listarPorCondominio(Long condominioId) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return funcionarioRepository.findByCondominioId(condominioId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FuncionarioDTO buscarPorId(Long id) {
        Funcionario f = funcionarioRepository.findById(id).orElseThrow(() -> new NotFoundException("Funcionário não encontrado"));
        if (!acessoService.podeAcessarCondominio(f.getCondominio().getId())) throw new ForbiddenException("Sem acesso");
        return toDTO(f);
    }

    @Transactional
    public FuncionarioDTO atualizar(Long id, FuncionarioDTO dto) {
        Funcionario f = funcionarioRepository.findById(id).orElseThrow(() -> new NotFoundException("Funcionário não encontrado"));
        if (!acessoService.podeEditarCondominio(f.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        f.setNome(dto.getNome());
        f.setFuncao(dto.getFuncao());
        f.setValorMensal(dto.getValorMensal());
        f = funcionarioRepository.save(f);
        return toDTO(f);
    }

    @Transactional
    public void excluir(Long id) {
        Funcionario f = funcionarioRepository.findById(id).orElseThrow(() -> new NotFoundException("Funcionário não encontrado"));
        if (!acessoService.podeEditarCondominio(f.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        funcionarioRepository.delete(f);
    }

    private FuncionarioDTO toDTO(Funcionario f) {
        FuncionarioDTO dto = new FuncionarioDTO();
        dto.setId(f.getId());
        dto.setNome(f.getNome());
        dto.setFuncao(f.getFuncao());
        dto.setValorMensal(f.getValorMensal());
        dto.setCondominioId(f.getCondominio().getId());
        return dto;
    }
}
