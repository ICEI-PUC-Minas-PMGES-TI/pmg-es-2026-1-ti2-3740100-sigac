package sigac.repository;

import sigac.domain.Inquilino;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquilinoRepository extends JpaRepository<Inquilino, Long> {

    List<Inquilino> findByCondominioId(Long condominioId);

    List<Inquilino> findByCondominioIdAndIdIn(Long condominioId, List<Long> ids);
}
