package sigac.repository;

import sigac.domain.ArrecadacaoMensal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArrecadacaoMensalRepository extends JpaRepository<ArrecadacaoMensal, Long> {
    Optional<ArrecadacaoMensal> findByCondominioIdAndAnoAndMes(Long condominioId, int ano, int mes);
    boolean existsByCondominioIdAndAnoAndMes(Long condominioId, int ano, int mes);
}

