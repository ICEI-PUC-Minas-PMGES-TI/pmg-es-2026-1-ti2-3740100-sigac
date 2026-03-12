package sigac.repository;

import sigac.domain.SindicoCondominio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SindicoCondominioRepository extends JpaRepository<SindicoCondominio, Long> {

    List<SindicoCondominio> findByCondominioId(Long condominioId);

    List<SindicoCondominio> findByUserId(Long userId);

    Optional<SindicoCondominio> findByCondominioIdAndUserId(Long condominioId, Long userId);
}
