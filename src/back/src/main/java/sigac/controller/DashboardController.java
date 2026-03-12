package sigac.controller;

import sigac.dto.DashboardGastosDTO;
import sigac.service.DashboardService;
import org.springframework.web.bind.annotation.*;

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
}
