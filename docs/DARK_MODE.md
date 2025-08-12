# Dark Mode - Sistema de Temas

## Visão Geral

O sistema de dark mode foi implementado com cores escuras puxadas para o azul, oferecendo uma experiência visual moderna e confortável para os olhos. O sistema permite alternar entre modo claro e escuro com persistência da preferência do usuário.

## Características do Dark Mode

### 🎨 **Paleta de Cores Escuras**

#### Cores de Fundo:
- **Fundo Principal**: `#0f172a` (Azul muito escuro)
- **Fundo Secundário**: `#1e293b` (Azul escuro)
- **Fundo Terciário**: `#334155` (Azul médio escuro)
- **Cards**: `#1e293b` (Azul escuro)

#### Cores de Texto (Melhoradas para Acessibilidade):
- **Texto Principal**: `#ffffff` (Branco puro)
- **Texto Secundário**: `#e2e8f0` (Branco suave)
- **Texto Mudo**: `#cbd5e1` (Cinza claro)

#### Cores de Destaque:
- **Primária**: `#4dabf7` (Azul claro)
- **Sucesso**: `#51cf66` (Verde claro)
- **Aviso**: `#ffd43b` (Amarelo claro)
- **Erro**: `#ff6b6b` (Vermelho claro)
- **Info**: `#74c0fc` (Azul info)

### 🌈 **Gradientes**

#### Gradiente Primário (Dark Mode):
```css
linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)
```

#### Gradiente Secundário (Dark Mode):
```css
linear-gradient(135deg, #3730a3 0%, #6366f1 100%)
```

## Implementação Técnica

### CSS Variables

O sistema utiliza variáveis CSS para gerenciar as cores:

```css
/* Light Mode (padrão) */
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
    --primary-color: #0d6efd;
    /* ... outras variáveis */
}

/* Dark Mode */
[data-theme="dark"] {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #f1f5f9;
    --primary-color: #4dabf7;
    /* ... outras variáveis */
}
```

### JavaScript

#### Inicialização do Tema:
```javascript
initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
}
```

#### Alternância de Tema:
```javascript
toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
}
```

#### Aplicação do Tema:
```javascript
setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.title = 'Mudar para modo claro';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.title = 'Mudar para modo escuro';
    }
}
```

### HTML

#### Botão de Toggle:
```html
<button class="theme-toggle" id="themeToggle" title="Alternar tema">
    <i class="fas fa-moon"></i>
</button>
```

## Elementos Estilizados

### 1. **Navbar**
- Gradiente azul escuro no dark mode
- Botão de toggle com efeito glassmorphism

### 2. **Cards**
- Fundo azul escuro (`#1e293b`)
- Bordas sutis com cores escuras
- Sombras mais pronunciadas

### 3. **Formulários**
- Inputs com fundo azul médio escuro
- Bordas em tons de azul
- Placeholder em cinza médio

### 4. **Tabelas**
- Cabeçalhos em azul médio escuro
- Linhas com bordas sutis
- Hover em azul muito claro

### 5. **Logs**
- Fundo azul escuro
- Bordas em azul médio
- Hover com transparência branca

### 6. **Progress Bar**
- Fundo em azul médio escuro
- Barra com cores adaptadas ao tema
- Efeito glow em azul claro

## Transições e Animações

### Transições Suaves
```css
* {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animações de Tema
- Transição suave entre modos (300ms)
- Efeito de escala no botão de toggle
- Mudança de ícone animada

## Persistência

### LocalStorage
O tema escolhido é salvo no localStorage:
```javascript
localStorage.setItem('theme', theme);
```

### Recuperação
Na inicialização, o tema é recuperado:
```javascript
const savedTheme = localStorage.getItem('theme') || 'light';
```

## Acessibilidade

### Preferência do Sistema
O sistema respeita a preferência do usuário:
```css
@media (prefers-color-scheme: dark) {
    /* Estilos para preferência do sistema */
}
```

### Reduced Motion
Respeita a preferência de movimento reduzido:
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Como Usar

### 1. **Alternar Tema**
- Clique no botão de lua/sol na navbar
- O tema alterna instantaneamente
- A preferência é salva automaticamente

### 2. **Indicadores Visuais**
- **Lua** 🌙: Modo claro ativo (clique para modo escuro)
- **Sol** ☀️: Modo escuro ativo (clique para modo claro)

### 3. **Feedback**
- Logs informam a mudança de tema
- Transições suaves entre modos
- Tooltip indica a ação do botão

## Personalização

### Modificar Cores

Para alterar as cores do dark mode, edite as variáveis CSS:

```css
[data-theme="dark"] {
    --bg-primary: #0f172a;        /* Fundo principal */
    --bg-secondary: #1e293b;      /* Fundo secundário */
    --primary-color: #4dabf7;     /* Cor primária */
    --text-primary: #f1f5f9;      /* Texto principal */
}
```

### Adicionar Novos Elementos

Para novos elementos, use as variáveis CSS:

```css
.novo-elemento {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}
```

### Temas Customizados

Para adicionar mais temas:

```css
[data-theme="custom"] {
    --bg-primary: #custom-color;
    --text-primary: #custom-text;
    /* ... outras variáveis */
}
```

## Benefícios

### 1. **Saúde Visual**
- Reduz fadiga ocular
- Melhor para uso noturno
- Contraste adequado

### 2. **Economia de Energia**
- Menos consumo em telas OLED
- Melhor para dispositivos móveis

### 3. **Experiência Moderna**
- Interface contemporânea
- Cores azuis elegantes
- Transições suaves

### 4. **Acessibilidade**
- **Alto contraste** para melhor legibilidade
- **Cores de texto otimizadas** para máxima visibilidade
- Respeita preferências do usuário
- Suporte a reduced motion
- **Contraste WCAG AA** em todos os elementos

## Troubleshooting

### Problemas Comuns

1. **Tema não persiste**
   - Verifique se localStorage está habilitado
   - Confirme se o JavaScript está carregado

2. **Transições não funcionam**
   - Verifique se o CSS está sendo carregado
   - Confirme se as variáveis CSS estão definidas

3. **Cores não aplicadas**
   - Verifique se o atributo `data-theme` está sendo definido
   - Confirme se as variáveis CSS estão sendo usadas

### Debug

Para debug, adicione no console:
```javascript
console.log('Tema atual:', document.documentElement.getAttribute('data-theme'));
console.log('Tema salvo:', localStorage.getItem('theme'));
```

## Melhorias de Acessibilidade

### Contraste Otimizado
- **Texto principal**: Branco puro (#ffffff) para máximo contraste
- **Texto secundário**: Branco suave (#e2e8f0) para boa legibilidade
- **Texto mudo**: Cinza claro (#cbd5e1) para informações auxiliares

### Elementos Específicos
- **Títulos**: Sempre em branco puro para máxima visibilidade
- **Parágrafos**: Branco suave para leitura confortável
- **Labels de formulário**: Branco puro com peso 600
- **Placeholders**: Cinza claro com opacidade 0.8
- **Logs**: Timestamps em cinza, mensagens em branco puro

### Garantias de Acessibilidade
- **Contraste WCAG AA** em todos os elementos
- **Cores forçadas** com `!important` para garantir aplicação
- **Herança de cor** para elementos não especificados
- **Hover states** com cores adequadas

## Conclusão

O sistema de dark mode oferece uma experiência visual moderna e confortável, com cores escuras puxadas para o azul que proporcionam uma interface elegante e funcional. A implementação é robusta, **altamente acessível** e facilmente personalizável, garantindo que todos os textos sejam perfeitamente visíveis e legíveis.
