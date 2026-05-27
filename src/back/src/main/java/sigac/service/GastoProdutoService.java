package sigac.service;

import sigac.domain.GastoProduto;
import sigac.dto.GastoProdutoDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.CondominioRepository;
import sigac.repository.GastoProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GastoProdutoService {

    private final GastoProdutoRepository gastoProdutoRepository;
    private final CondominioRepository condominioRepository;
    private final CondominioAcessoService acessoService;

    public GastoProdutoService(GastoProdutoRepository gastoProdutoRepository, CondominioRepository condominioRepository, CondominioAcessoService acessoService) {
        this.gastoProdutoRepository = gastoProdutoRepository;
        this.condominioRepository = condominioRepository;
        this.acessoService = acessoService;
    }

    @Transactional
    public GastoProdutoDTO criar(Long condominioId, GastoProdutoDTO dto) {
        if (!acessoService.podeEditarCondominio(condominioId)) throw new ForbiddenException("Sem permissão");
        var condominio = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        GastoProduto g = new GastoProduto();
        g.setDescricao(dto.getDescricao());
        g.setValor(dto.getValor());
        g.setData(dto.getData());
        g.setLojaFornecedor(dto.getLojaFornecedor());
        g.setCondominio(condominio);
        g = gastoProdutoRepository.save(g);
        dto.setId(g.getId());
        dto.setCondominioId(condominioId);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<GastoProdutoDTO> listarPorCondominio(Long condominioId) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return gastoProdutoRepository.findByCondominioId(condominioId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public GastoProdutoDTO atualizar(Long id, GastoProdutoDTO dto) {
        GastoProduto g = gastoProdutoRepository.findById(id).orElseThrow(() -> new NotFoundException("Gasto não encontrado"));
        if (!acessoService.podeEditarCondominio(g.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        g.setDescricao(dto.getDescricao());
        g.setValor(dto.getValor());
        g.setData(dto.getData());
        g.setLojaFornecedor(dto.getLojaFornecedor());
        g = gastoProdutoRepository.save(g);
        return toDTO(g);
    }

    @Transactional
    public void excluir(Long id) {
        GastoProduto g = gastoProdutoRepository.findById(id).orElseThrow(() -> new NotFoundException("Gasto não encontrado"));
        if (!acessoService.podeEditarCondominio(g.getCondominio().getId())) throw new ForbiddenException("Sem permissão");
        gastoProdutoRepository.delete(g);
    }

    private GastoProdutoDTO toDTO(GastoProduto g) {
        GastoProdutoDTO dto = new GastoProdutoDTO();
        dto.setId(g.getId());
        dto.setDescricao(g.getDescricao());
        dto.setValor(g.getValor());
        dto.setData(g.getData());
        dto.setLojaFornecedor(g.getLojaFornecedor());
        dto.setCondominioId(g.getCondominio().getId());
        return dto;
    }
}
