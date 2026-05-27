package sigac.dto;

import sigac.domain.Role;

import java.util.List;

public class AuthResponse {

    private String token;
    private String email;
    private String nome;
    private Role role;
    private Long userId;
    private List<Long> condominioIds;

    public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }

    public static class AuthResponseBuilder {
        private String token; private String email; private String nome; private Role role; private Long userId; private List<Long> condominioIds;
        public AuthResponseBuilder token(String t) { this.token = t; return this; }
        public AuthResponseBuilder email(String e) { this.email = e; return this; }
        public AuthResponseBuilder nome(String n) { this.nome = n; return this; }
        public AuthResponseBuilder role(Role r) { this.role = r; return this; }
        public AuthResponseBuilder userId(Long id) { this.userId = id; return this; }
        public AuthResponseBuilder condominioIds(List<Long> ids) { this.condominioIds = ids; return this; }
        public AuthResponse build() { AuthResponse r = new AuthResponse(); r.token = token; r.email = email; r.nome = nome; r.role = role; r.userId = userId; r.condominioIds = condominioIds; return r; }
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getNome() { return nome; }
    public Role getRole() { return role; }
    public Long getUserId() { return userId; }
    public List<Long> getCondominioIds() { return condominioIds; }
}

