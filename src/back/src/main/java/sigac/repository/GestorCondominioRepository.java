package sigac.repository;

import sigac.domain.GestorCondominio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GestorCondominioRepository extends JpaRepository<GestorCondominio, Long> {

    List<GestorCondominio> findByCondominioId(Long condominioId);

    List<GestorCondominio> findByUserId(Long userId);

    Optional<GestorCondominio> findByCondominioIdAndUserId(Long condominioId, Long userId);

    boolean existsByCondominioIdAndUserId(Long condominioId, Long userId);
}
