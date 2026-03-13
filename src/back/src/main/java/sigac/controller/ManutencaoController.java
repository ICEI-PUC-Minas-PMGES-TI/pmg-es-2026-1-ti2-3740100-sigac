package sigac.controller;

import sigac.dto.ManutencaoDTO;
import sigac.service.ManutencaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/condominios/{condominioId}/manutencoes")
public class ManutencaoController {

    private final ManutencaoService manutencaoService;

    public ManutencaoController(ManutencaoService manutencaoService) {
        this.manutencaoService = manutencaoService;
    }

    @GetMapping
    public List<ManutencaoDTO> listar(@PathVariable Long condominioId) {
        return manutencaoService.listarPorCondominio(condominioId);
    }

    @PostMapping
    public ResponseEntity<ManutencaoDTO> criar(@PathVariable Long condominioId, @Valid @RequestBody ManutencaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(manutencaoService.criar(condominioId, dto));
    }

    @GetMapping("/{id}")
    public ManutencaoDTO buscar(@PathVariable Long id) {
        return manutencaoService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ManutencaoDTO atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ManutencaoDTO dto,
            @RequestParam(required = false, defaultValue = "false") boolean notificar) {
        return manutencaoService.atualizar(id, dto, notificar);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        manutencaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
