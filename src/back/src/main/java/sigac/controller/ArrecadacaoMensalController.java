package sigac.controller;

import jakarta.validation.Valid;
import sigac.dto.ArrecadacaoMensalDTO;
import sigac.dto.ArrecadacaoMensalLogDTO;
import sigac.service.ArrecadacaoMensalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/condominios/{condominioId}/arrecadacao-mensal")
public class ArrecadacaoMensalController {

    private final ArrecadacaoMensalService arrecadacaoMensalService;

    public ArrecadacaoMensalController(ArrecadacaoMensalService arrecadacaoMensalService) {
        this.arrecadacaoMensalService = arrecadacaoMensalService;
    }

    @GetMapping
    public ArrecadacaoMensalDTO obter(
            @PathVariable Long condominioId,
            @RequestParam int ano,
            @RequestParam int mes
    ) {
        return arrecadacaoMensalService.obter(condominioId, ano, mes);
    }

    @PutMapping
    public ArrecadacaoMensalDTO definir(
            @PathVariable Long condominioId,
            @Valid @RequestBody ArrecadacaoMensalDTO dto
    ) {
        return arrecadacaoMensalService.definir(condominioId, dto);
    }

    @GetMapping("/logs")
    public List<ArrecadacaoMensalLogDTO> logs(
            @PathVariable Long condominioId,
            @RequestParam int ano,
            @RequestParam int mes
    ) {
        return arrecadacaoMensalService.listarLogs(condominioId, ano, mes);
    }
}

