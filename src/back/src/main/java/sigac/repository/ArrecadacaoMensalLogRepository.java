package sigac.repository;

import sigac.domain.ArrecadacaoMensalLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArrecadacaoMensalLogRepository extends JpaRepository<ArrecadacaoMensalLog, Long> {
    List<ArrecadacaoMensalLog> findByArrecadacaoMensalCondominioIdAndArrecadacaoMensalAnoAndArrecadacaoMensalMesOrderByAlteradoEmDesc(
            Long condominioId, int ano, int mes
    );
}

