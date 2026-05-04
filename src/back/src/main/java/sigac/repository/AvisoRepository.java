package sigac.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import sigac.domain.Aviso;

import java.util.List;
import java.util.Optional;

public interface AvisoRepository extends JpaRepository<Aviso, Long> {

    @EntityGraph(attributePaths = "destinatarios")
    List<Aviso> findByCondominioIdOrderByCriadoEmDescIdDesc(Long condominioId);

    @EntityGraph(attributePaths = "destinatarios")
    Optional<Aviso> findByManutencaoIdOrigemAndCondominioId(Long manutencaoIdOrigem, Long condominioId);
}
