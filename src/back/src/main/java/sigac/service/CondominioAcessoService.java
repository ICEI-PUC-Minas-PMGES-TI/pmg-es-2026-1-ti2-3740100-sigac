package sigac.service;

import sigac.domain.Role;
import sigac.repository.GestorCondominioRepository;
import sigac.repository.SindicoCondominioRepository;
import sigac.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Verifica se o usuário atual pode acessar um condomínio (admin: todos; gestor/síndico: apenas os vinculados).
 */
@Service
public class CondominioAcessoService {

    private final GestorCondominioRepository gestorCondominioRepository;
    private final SindicoCondominioRepository sindicoCondominioRepository;

    public CondominioAcessoService(GestorCondominioRepository gestorCondominioRepository, SindicoCondominioRepository sindicoCondominioRepository) {
        this.gestorCondominioRepository = gestorCondominioRepository;
        this.sindicoCondominioRepository = sindicoCondominioRepository;
    }

    public boolean podeAcessarCondominio(Long condominioId) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) return false;
        if (principal.getRole() == Role.SIGAC_ADMIN) return true;
        if (principal.getRole() == Role.GESTOR) {
            return gestorCondominioRepository.existsByCondominioIdAndUserId(condominioId, principal.getId());
        }
        if (principal.getRole() == Role.SINDICO) {
            return sindicoCondominioRepository.findByCondominioIdAndUserId(condominioId, principal.getId()).isPresent();
        }
        return false;
    }

    /** Gestor pode editar; síndico apenas visualizar. */
    public boolean podeEditarCondominio(Long condominioId) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) return false;
        if (principal.getRole() == Role.SIGAC_ADMIN) return true;
        if (principal.getRole() == Role.GESTOR) {
            return gestorCondominioRepository.existsByCondominioIdAndUserId(condominioId, principal.getId());
        }
        return false;
    }

    /** Síndico vinculado pode abrir solicitação de manutenção para o gestor analisar. */
    public boolean podeSolicitarManutencao(Long condominioId) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) return false;
        if (principal.getRole() != Role.SINDICO) return false;
        return sindicoCondominioRepository.findByCondominioIdAndUserId(condominioId, principal.getId()).isPresent();
    }

    public static UserPrincipal getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) auth.getPrincipal();
        }
        return null;
    }
}
