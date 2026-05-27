package sigac.controller;

import sigac.dto.InquilinoDTO;
import sigac.service.InquilinoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/condominios/{condominioId}/inquilinos")
public class InquilinoController {

    private final InquilinoService inquilinoService;

    public InquilinoController(InquilinoService inquilinoService) {
        this.inquilinoService = inquilinoService;
    }

    @GetMapping
    public List<InquilinoDTO> listar(@PathVariable Long condominioId) {
        return inquilinoService.listarPorCondominio(condominioId);
    }

    @PostMapping
    public ResponseEntity<InquilinoDTO> criar(@PathVariable Long condominioId, @Valid @RequestBody InquilinoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inquilinoService.criar(condominioId, dto));
    }

    @PutMapping("/{id}")
    public InquilinoDTO atualizar(@PathVariable Long id, @Valid @RequestBody InquilinoDTO dto) {
        return inquilinoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        inquilinoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
