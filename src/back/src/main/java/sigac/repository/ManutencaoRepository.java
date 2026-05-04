package sigac.repository;

import sigac.domain.Manutencao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ManutencaoRepository extends JpaRepository<Manutencao, Long> {

    List<Manutencao> findByCondominioId(Long condominioId);

    List<Manutencao> findByCondominioIdAndDataBetween(Long condominioId, LocalDate inicio, LocalDate fim);
}
