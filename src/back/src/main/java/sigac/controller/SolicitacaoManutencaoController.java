package sigac.controller;

import sigac.dto.CriarSolicitacaoManutencaoRequest;
import sigac.dto.SolicitacaoManutencaoContagemDTO;
import sigac.dto.SolicitacaoManutencaoDTO;
import sigac.service.SolicitacaoManutencaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/condominios/{condominioId}/solicitacoes-manutencao")
public class SolicitacaoManutencaoController {

    private final SolicitacaoManutencaoService solicitacaoManutencaoService;

    public SolicitacaoManutencaoController(SolicitacaoManutencaoService solicitacaoManutencaoService) {
        this.solicitacaoManutencaoService = solicitacaoManutencaoService;
    }

    @PostMapping
    public ResponseEntity<SolicitacaoManutencaoDTO> criar(
            @PathVariable Long condominioId,
            @Valid @RequestBody CriarSolicitacaoManutencaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacaoManutencaoService.criar(condominioId, request));
    }

    @GetMapping
    public List<SolicitacaoManutencaoDTO> listar(@PathVariable Long condominioId) {
        return solicitacaoManutencaoService.listar(condominioId);
    }

    @GetMapping("/contagem")
    public SolicitacaoManutencaoContagemDTO contagem(@PathVariable Long condominioId) {
        return solicitacaoManutencaoService.contar(condominioId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> reprovar(@PathVariable Long condominioId, @PathVariable Long id) {
        solicitacaoManutencaoService.reprovar(condominioId, id);
        return ResponseEntity.noContent().build();
    }
}
