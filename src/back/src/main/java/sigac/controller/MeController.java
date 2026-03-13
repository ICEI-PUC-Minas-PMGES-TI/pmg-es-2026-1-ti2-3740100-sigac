package sigac.controller;

import sigac.dto.AlterarSenhaRequest;
import sigac.service.AuthService;
import sigac.service.CondominioAcessoService;
import sigac.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/me")
public class MeController {

    private final AuthService authService;

    public MeController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/senha")
    public ResponseEntity<Void> alterarSenha(@Valid @RequestBody AlterarSenhaRequest request) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        authService.alterarSenha(principal.getId(), request.getSenhaAtual(), request.getNovaSenha());
        return ResponseEntity.noContent().build();
    }
}
