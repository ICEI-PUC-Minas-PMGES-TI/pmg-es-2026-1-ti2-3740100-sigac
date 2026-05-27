package sigac.service;

import sigac.domain.*;
import sigac.dto.AuthResponse;
import sigac.dto.LoginRequest;
import sigac.repository.GestorCondominioRepository;
import sigac.repository.SindicoCondominioRepository;
import sigac.repository.UserRepository;
import sigac.security.JwtTokenProvider;
import sigac.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final GestorCondominioRepository gestorCondominioRepository;
    private final SindicoCondominioRepository sindicoCondominioRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, GestorCondominioRepository gestorCondominioRepository, SindicoCondominioRepository sindicoCondominioRepository, AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.gestorCondominioRepository = gestorCondominioRepository;
        this.sindicoCondominioRepository = sindicoCondominioRepository;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String token = jwtTokenProvider.generateToken(auth);
        List<Long> condominioIds = getCondominioIdsForUser(principal.getId(), principal.getRole());
        return AuthResponse.builder()
                .token(token)
                .email(principal.getEmail())
                .nome(principal.getNome())
                .role(principal.getRole())
                .userId(principal.getId())
                .condominioIds(condominioIds)
                .build();
    }

    private List<Long> getCondominioIdsForUser(Long userId, Role role) {
        if (role == Role.SIGAC_ADMIN) {
            return List.of();
        }
        if (role == Role.GESTOR) {
            return gestorCondominioRepository.findByUserId(userId).stream()
                    .map(g -> g.getCondominio().getId())
                    .toList();
        }
        if (role == Role.SINDICO) {
            return sindicoCondominioRepository.findByUserId(userId).stream()
                    .map(s -> s.getCondominio().getId())
                    .toList();
        }
        return List.of();
    }

    @Transactional
    public void alterarSenha(Long userId, String senhaAtual, String novaSenha) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        if (!passwordEncoder.matches(senhaAtual, user.getPassword())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }
        user.setPassword(passwordEncoder.encode(novaSenha));
        userRepository.save(user);
    }
}
