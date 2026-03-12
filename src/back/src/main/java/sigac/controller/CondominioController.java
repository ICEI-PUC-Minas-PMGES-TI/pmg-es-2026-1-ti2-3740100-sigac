package sigac.controller;

import sigac.dto.CondominioDTO;
import sigac.dto.CreateUserRequest;
import sigac.dto.UserDTO;
import sigac.service.CondominioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/condominios")
public class CondominioController {

    private final CondominioService condominioService;

    public CondominioController(CondominioService condominioService) {
        this.condominioService = condominioService;
    }

    @GetMapping
    public List<CondominioDTO> listar() {
        return condominioService.listarCondominios();
    }

    @GetMapping("/{id}")
    public CondominioDTO buscar(@PathVariable Long id) {
        return condominioService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<CondominioDTO> criar(@Valid @RequestBody CondominioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condominioService.criarCondominio(dto));
    }

    @PutMapping("/{id}")
    public CondominioDTO atualizar(@PathVariable Long id, @Valid @RequestBody CondominioDTO dto) {
        return condominioService.atualizar(id, dto);
    }

    @PostMapping("/{id}/gestores")
    public ResponseEntity<UserDTO> criarGestor(@PathVariable Long id, @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condominioService.criarGestor(id, request));
    }

    @GetMapping("/{id}/gestores")
    public List<UserDTO> listarGestores(@PathVariable Long id) {
        return condominioService.listarGestores(id);
    }

    @PostMapping("/{id}/sindicos")
    public ResponseEntity<UserDTO> criarSindico(@PathVariable Long id, @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condominioService.criarSindico(id, request));
    }

    @GetMapping("/{id}/sindicos")
    public List<UserDTO> listarSindicos(@PathVariable Long id) {
        return condominioService.listarSindicos(id);
    }
}
