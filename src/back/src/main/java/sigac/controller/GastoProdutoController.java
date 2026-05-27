package sigac.controller;

import sigac.dto.GastoProdutoDTO;
import sigac.service.GastoProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/condominios/{condominioId}/gastos-produto")
public class GastoProdutoController {

    private final GastoProdutoService gastoProdutoService;

    public GastoProdutoController(GastoProdutoService gastoProdutoService) {
        this.gastoProdutoService = gastoProdutoService;
    }

    @GetMapping
    public List<GastoProdutoDTO> listar(@PathVariable Long condominioId) {
        return gastoProdutoService.listarPorCondominio(condominioId);
    }

    @PostMapping
    public ResponseEntity<GastoProdutoDTO> criar(@PathVariable Long condominioId, @Valid @RequestBody GastoProdutoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoProdutoService.criar(condominioId, dto));
    }

    @PutMapping("/{id}")
    public GastoProdutoDTO atualizar(@PathVariable Long id, @Valid @RequestBody GastoProdutoDTO dto) {
        return gastoProdutoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        gastoProdutoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
