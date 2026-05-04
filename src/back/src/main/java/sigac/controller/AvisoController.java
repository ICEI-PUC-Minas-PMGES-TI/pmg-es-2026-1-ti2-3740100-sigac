package sigac.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sigac.dto.AvisoDTO;
import sigac.service.AvisoService;

import java.util.List;

@RestController
@RequestMapping("/condominios/{condominioId}/avisos")
public class AvisoController {

    private final AvisoService avisoService;

    public AvisoController(AvisoService avisoService) {
        this.avisoService = avisoService;
    }

    @GetMapping
    public List<AvisoDTO> listar(@PathVariable Long condominioId) {
        return avisoService.listarPorCondominio(condominioId);
    }

    @PostMapping
    public ResponseEntity<AvisoDTO> criar(@PathVariable Long condominioId, @Valid @RequestBody AvisoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avisoService.criarManual(condominioId, dto));
    }
}
