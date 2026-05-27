package sigac.repository;

import sigac.domain.GastoProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface GastoProdutoRepository extends JpaRepository<GastoProduto, Long> {

    List<GastoProduto> findByCondominioId(Long condominioId);

    List<GastoProduto> findByCondominioIdAndDataBetween(Long condominioId, LocalDate inicio, LocalDate fim);
}
