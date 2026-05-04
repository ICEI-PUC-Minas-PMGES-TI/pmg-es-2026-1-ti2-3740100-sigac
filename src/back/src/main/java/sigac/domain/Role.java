package sigac.domain;

public enum Role {
    SIGAC_ADMIN,   // Cria condomínios e gestores
    GESTOR,        // Gestor do condomínio: cadastra funcionários, manutenções, gastos, inquilinos
    SINDICO        // Apenas visualiza gastos do condomínio
}
