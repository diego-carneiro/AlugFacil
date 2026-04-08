# Prompt para Claude Code — AlugFácil Consultórios

Cole o conteúdo abaixo diretamente no Claude Code para gerar o `CLAUDE.md` e em seguida construir toda a landing page.

---

## Prompt

```
Você é um engenheiro frontend sênior e UI designer. Sua primeira tarefa é criar o arquivo CLAUDE.md na raiz do projeto e em seguida construir toda a aplicação.

---

## PASSO 1 — Gerar o CLAUDE.md

Crie o arquivo `CLAUDE.md` na raiz do projeto com EXATAMENTE este conteúdo (ajuste apenas se necessário para paths):

---

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
--color-primary-50: #EBF5FF        /* Fundo azul ultra-leve */
--color-primary-100: #D1E9FF
--color-primary-200: #A3D3FF
--color-primary-300: #66B5FF
--color-primary-400: #3399FF
--color-primary-500: #0066CC        /* Azul odontológico — cor principal */
--color-primary-600: #0052A3
--color-primary-700: #003D7A
--color-primary-800: #002952
--color-primary-900: #001A33

--color-accent-50: #FFF9EB
--color-accent-100: #FFF0CC
--color-accent-200: #FFE199
--color-accent-300: #FFD166         /* Dourado suave — destaque */
--color-accent-400: #FFC233
--color-accent-500: #E6A800         /* Dourado forte */
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

Importar no `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=DM+Sans:wght@400;500&family=Space+Mono&display=swap" rel="stylesheet">
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
│   └── images/          # Placeholders de consultórios (usar Unsplash URLs)
├── components/
│   ├── ui/              # Componentes base (Button, Card, Badge, Container)
│   ├── layout/          # Header, Footer, MobileMenu
│   └── sections/        # Hero, HowItWorks, Listings, ForOwners, About, Contact
├── data/
│   └── consultories.ts  # Array de consultórios mock
├── hooks/
│   └── useScrollReveal.ts
├── pages/
│   ├── Home.tsx
│   ├── Listings.tsx
│   ├── ConsultoryDetail.tsx
│   ├── RegisterConsultory.tsx
│   └── Contact.tsx
├── styles/
│   └── index.css        # Tailwind imports + custom properties
├── App.tsx
├── Router.tsx
└── main.tsx
```

## Páginas e Seções

### 1. Home (`/`)

**Hero Section**
- Imagem grande de consultório odontológico como background (overlay gradient escuro)
- Badge animado: "🦷 Marketplace de consultórios odontológicos"
- H1: "Encontre consultórios odontológicos para alugar por período"
- Subtítulo: "Conectamos dentistas que precisam de espaço com consultórios que possuem horários disponíveis."
- 2 CTAs lado a lado:
  - Primário (azul): "Quero alugar um consultório" → link WhatsApp
  - Secundário (dourado/outline): "Quero disponibilizar meu consultório" → link WhatsApp
- Indicadores flutuantes animados: "12+ consultórios", "São José dos Campos"

**Como Funciona**
- Dividido em 2 tabs/colunas: "Para quem quer alugar" | "Para quem quer disponibilizar"
- 4 steps cada, com ícone numerado + animação stagger
- Steps de quem aluga:
  1. Escolha um consultório disponível
  2. Informe o período desejado
  3. A AlugFácil faz a conexão com o proprietário
  4. Você agenda e realiza o atendimento
- Steps de quem disponibiliza:
  1. Cadastre seu consultório
  2. Informe dias e horários disponíveis
  3. Receba dentistas interessados
  4. Gere renda com horários ociosos

**Consultórios em Destaque**
- Grid 3 colunas (mobile: 1 col scroll horizontal)
- Cards com: imagem, nome, localização, preço "a partir de R$ X / período", lista de equipamentos como badges, botão "Ver detalhes"
- Link "Ver todos os consultórios →"

**Seção Proprietários**
- Background azul escuro
- H2: "Tem um consultório com horários vagos?"
- Texto + CTA "Cadastrar meu consultório"

**Sobre a AlugFácil**
- Texto institucional com animação de aparecimento
- Possíveis números/stats animados (ex: "Conectando profissionais em SJC")

**Contato**
- WhatsApp + Instagram + formulário simples (nome, email, mensagem — sem backend, usar mailto ou WhatsApp link)

### 2. Consultórios Disponíveis (`/consultorios`)
- Filtros simples no topo (região, faixa de preço) — apenas visual por enquanto
- Grid de cards com todos os consultórios
- Cada card é clicável → leva para detalhe

### 3. Página do Consultório (`/consultorios/:id`)
- Galeria de fotos (carousel ou grid)
- Nome, localização, descrição
- Lista completa de equipamentos com ícones
- Valor por período em destaque
- Botão grande fixo no mobile: "📲 Falar no WhatsApp para reservar"
- Seção "Outros consultórios que podem te interessar"

### 4. Cadastre seu Consultório (`/cadastrar`)
- Formulário estilizado: nome, telefone, endereço, equipamentos, fotos, horários
- Envio via WhatsApp (monta mensagem e abre link wa.me)
- Sem backend — tudo é montado no link do WhatsApp

### 5. Contato (`/contato`)
- WhatsApp: link direto
- Instagram: @alugfacilconsultorios
- Formulário de contato (mailto ou WhatsApp)

## Dados Mock dos Consultórios

```typescript
// src/data/consultories.ts
export interface Consultory {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  pricePerPeriod: number;
  description: string;
  equipment: string[];
  images: string[];       // URLs de imagens (Unsplash dental/office)
  whatsappNumber: string;
  featured: boolean;
}

export const consultories: Consultory[] = [
  {
    id: "jardim-aquarius",
    name: "Consultório Jardim Aquarius",
    neighborhood: "Jardim Aquarius",
    city: "São José dos Campos",
    pricePerPeriod: 300,
    description: "Consultório completo em excelente localização...",
    equipment: ["Equipo completo", "Compressor", "Bomba a vácuo", "Ar-condicionado", "Wi-Fi", "Sala de espera", "Autoclave", "Internet"],
    images: ["url1", "url2", "url3"],
    whatsappNumber: "5512999999999",
    featured: true,
  },
  {
    id: "vila-adyana",
    name: "Consultório Vila Adyana",
    neighborhood: "Vila Adyana",
    city: "São José dos Campos",
    pricePerPeriod: 250,
    description: "Espaço moderno e equipado...",
    equipment: ["Raio-x", "Ultrassom", "Ar-condicionado", "Recepção equipada"],
    images: ["url1", "url2"],
    whatsappNumber: "5512999999999",
    featured: true,
  },
  // Adicionar mais 4-6 consultórios fictícios variados
];
```

## Links e CTAs — WhatsApp

Todos os botões de ação abrem WhatsApp com mensagem pré-preenchida:

```typescript
const buildWhatsAppLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

// Exemplo para "Quero alugar"
buildWhatsAppLink("5512999999999", "Olá! Vi o consultório no site AlugFácil e tenho interesse em alugar. Podemos conversar?");

// Exemplo para "Cadastrar consultório"
buildWhatsAppLink("5512999999999", "Olá! Quero cadastrar meu consultório na AlugFácil. Como funciona?");
```

## Imagens

Usar URLs do Unsplash para placeholders temáticos:
- Consultórios dentários: buscar "dental office", "dental clinic interior", "dentist chair"
- Equipamentos: "dental equipment"
- Profissionais: "dentist professional"

Exemplo de URLs:
```
https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800  (consultório)
https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800  (cadeira)
https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800  (dentista)
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

---

## PASSO 2 — Construir o projeto

Após criar o `CLAUDE.md`, siga EXATAMENTE as instruções dele para:

1. Inicializar o projeto com Vite + React + TypeScript
2. Instalar todas as dependências listadas
3. Configurar Tailwind com o Vite plugin
4. Configurar as fontes no index.html
5. Criar a estrutura de pastas
6. Implementar todos os componentes, páginas e seções descritos
7. Configurar o React Router com todas as rotas
8. Adicionar os dados mock dos consultórios
9. Implementar todas as animações com Motion
10. Garantir responsividade completa
11. Testar rodando `npm run dev`

Comece agora. Crie o CLAUDE.md primeiro, depois construa o projeto completo.
```

---

## Como Usar

1. Abra o **Claude Code** no terminal
2. Crie uma pasta para o projeto: `mkdir alugfacil && cd alugfacil`
3. Cole o prompt acima inteiro no Claude Code
4. Aguarde a construção completa
5. Rode `npm run dev` para ver o resultado
