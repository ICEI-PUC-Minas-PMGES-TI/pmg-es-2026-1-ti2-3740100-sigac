package sigac.controller;

import sigac.dto.DashboardGastosDTO;
import sigac.service.DashboardService;
import jakarta.mail.MessagingException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/condominios/{condominioId}/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/gastos-mensais")
    public DashboardGastosDTO gastosMensais(
            @PathVariable Long condominioId,
            @RequestParam int ano,
            @RequestParam int mes) {
        return dashboardService.relatorioGastosMensais(condominioId, ano, mes);
    }

    @PostMapping(value = "/relatorio-email", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> enviarRelatorioEmail(
            @PathVariable Long condominioId,
            @RequestParam("email") List<String> emails,
            @RequestParam int ano,
            @RequestParam int mes,
            @RequestParam("arquivo") MultipartFile arquivo) {
        try {
            byte[] bytes = arquivo.getBytes();
            String nome = arquivo.getOriginalFilename();
            int n = dashboardService.enviarRelatorioPorEmail(condominioId, emails, ano, mes, bytes, nome != null ? nome : "");
            String msg = n == 1
                    ? "Relatório enviado com sucesso para 1 destinatário."
                    : "Relatório enviado com sucesso para " + n + " destinatários.";
            return ResponseEntity.ok(Map.of("message", msg));
        } catch (MessagingException e) {
            String detalhe = e.getMessage() != null && !e.getMessage().isBlank() ? e.getMessage() : "Falha no envio";
            return ResponseEntity.status(502).body(Map.of("message", "Não foi possível enviar o e-mail: " + detalhe + ". Verifique os endereços e as configurações de correio."));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Não foi possível ler o arquivo enviado."));
        }
    }
}
