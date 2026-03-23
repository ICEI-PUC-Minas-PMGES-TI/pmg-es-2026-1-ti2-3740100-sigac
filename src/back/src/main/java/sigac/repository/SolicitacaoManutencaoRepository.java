package sigac.repository;

import sigac.domain.SolicitacaoManutencao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitacaoManutencaoRepository extends JpaRepository<SolicitacaoManutencao, Long> {

    List<SolicitacaoManutencao> findByCondominioIdOrderByCriadoEmDesc(Long condominioId);

    long countByCondominioId(Long condominioId);

    Optional<SolicitacaoManutencao> findByIdAndCondominioId(Long id, Long condominioId);
}
