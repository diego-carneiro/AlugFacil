# CLAUDE.md — AlugFácil Consultórios

## Visão do Projeto

Landing page/site institucional para a **AlugFácil Consultórios** — plataforma que conecta proprietários de consultórios odontológicos com dentistas que precisam de espaço para atender por período. Fase atual: **MVP de validação** com intermediação manual via WhatsApp. Sem backend — apenas frontend estático com links de contato.

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 18+ com TypeScript |
| Build | Vite |
| Estilização | Tailwind CSS 3+ |
| Animações | Motion (framer-motion) |
| Roteamento | React Router DOM v6 |
| Ícones | Lucide React |
| Fontes | Google Fonts (ver Design Tokens) |

### Instalação

```bash
npm create vite@latest alugfacil -- --template react-ts
cd alugfacil
npm install
npm install tailwindcss @tailwindcss/vite
npm install motion react-router-dom lucide-react
```

### Configuração do Tailwind (Vite plugin)

Em `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Em `src/index.css`:
```css
@import "tailwindcss";
```

## Design Tokens — Identidade Visual Odontológica

### Filosofia de Design
- **Tom**: Profissional, limpo, confiável — como um consultório premium
- **Estética**: Moderna e acolhedora. Cantos arredondados suaves, espaçamento generoso, hierarquia visual clara
- **Diferencial**: Fotos grandes de consultórios, micro-interações suaves, cards estilo marketplace

### Paleta de Cores

```
--color-primary-50: #EBF5FF
--color-primary-100: #D1E9FF
--color-primary-200: #A3D3FF
--color-primary-300: #66B5FF
--color-primary-400: #3399FF
--color-primary-500: #0066CC
--color-primary-600: #0052A3
--color-primary-700: #003D7A
--color-primary-800: #002952
--color-primary-900: #001A33

--color-accent-50: #FFF9EB
--color-accent-100: #FFF0CC
--color-accent-200: #FFE199
--color-accent-300: #FFD166
--color-accent-400: #FFC233
--color-accent-500: #E6A800
--color-accent-600: #B38600

--color-neutral-50: #FAFBFC
--color-neutral-100: #F1F3F5
--color-neutral-200: #E2E6EA
--color-neutral-300: #CED4DA
--color-neutral-400: #ADB5BD
--color-neutral-500: #6C757D
--color-neutral-600: #495057
--color-neutral-700: #343A40
--color-neutral-800: #212529
--color-neutral-900: #0D1117

--color-success: #2ECC71
--color-white: #FFFFFF
```

### Tipografia

```
Font Display (títulos): "Plus Jakarta Sans", sans-serif  — weight 600, 700, 800
Font Body (texto):       "DM Sans", sans-serif           — weight 400, 500
Font Accent (badges):    "Space Mono", monospace          — weight 400
```

### Espaçamento e Layout

- Container max: 1280px, padding horizontal: 24px (mobile) / 80px (desktop)
- Seções: padding vertical 80px (mobile) / 120px (desktop)
- Border radius padrão: 16px (cards), 12px (botões), 24px (imagens)
- Sombras: `0 4px 24px rgba(0, 102, 204, 0.08)` (leve), `0 12px 48px rgba(0, 102, 204, 0.15)` (hover)

### Animações (Motion)

- **Entrada de seções**: fade-in + slide-up (y: 40 → 0), duration 0.6s, easeOut
- **Cards**: staggerChildren 0.1s, hover scale 1.02 com shadow elevação
- **Botões**: whileTap scale 0.97, hover com brightness shift
- **Página de consultório**: imagens com layout animation
- **Scroll**: usar `whileInView` com `viewport={{ once: true, amount: 0.3 }}`

## Estrutura de Pastas

```
src/
├── assets/
│   └── images/
├── components/
│   ├── ui/
│   ├── layout/
│   └── sections/
├── data/
│   └── consultories.ts
├── hooks/
│   └── useScrollReveal.ts
├── pages/
│   ├── Home.tsx
│   ├── Listings.tsx
│   ├── ConsultoryDetail.tsx
│   ├── RegisterConsultory.tsx
│   └── Contact.tsx
├── styles/
│   └── index.css
├── App.tsx
├── Router.tsx
└── main.tsx
```

## Regras de Qualidade

1. **TypeScript estrito** — sem `any`, interfaces para todos os dados
2. **Componentes reutilizáveis** — Button, Card, Badge, Container, SectionTitle
3. **Responsivo** — mobile-first, breakpoints: sm(640) md(768) lg(1024) xl(1280)
4. **Acessibilidade** — aria-labels nos botões, alt nas imagens, contraste WCAG AA
5. **Animações com Motion** — usar `motion.div`, `AnimatePresence`, `whileInView`
6. **Sem backend** — dados mock, links WhatsApp, sem API calls
7. **SEO básico** — title, meta description, Open Graph tags no index.html
8. **Performance** — lazy loading de imagens, code splitting por rota com React.lazy
