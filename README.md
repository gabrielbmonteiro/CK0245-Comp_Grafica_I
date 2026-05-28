# CK0245 - Computação Gráfica I 🎮🧊

Este repositório contém o projeto de renderização 3D interativa desenvolvido para a disciplina de **Computação Gráfica I** da Universidade Federal do Ceará (UFC). 

O projeto foi construído do zero utilizando a API nativa **WebGL** e a linguagem de sombreamento **GLSL**, sem a utilização de engines de alto nível. O objetivo foi aplicar na prática os fundamentos matemáticos da síntese de imagens, pipeline gráfico e álgebra linear espacial.

---

## 🚀 Conceitos e Algoritmos Implementados

A cena consiste em um ambiente de interior (sala de estar) totalmente modelado via código e interativo, incorporando os seguintes pilares da engenharia gráfica:

### 1. Transformações Geométricas e Matrizes (MVP)
* Modelagem hierárquica de todos os móveis (sofás, cadeiras, estante, TV, mesa redonda de vidro e plantas) utilizando um único modelo de cubo primitivo.
* Controle rigoroso da pilha de matrizes (`Matrix4`) para **Translação, Rotação e Escala** locais de cada vértice.
* Projeção perspectiva calculada dinamicamente para manter o *Aspect Ratio* nativo da janela (Fullscreen).

### 2. Câmera Virtual Interativa (LookAt)
* Implementação de uma câmera em primeira pessoa manipulável pelo teclado.
* A câmera altera dinamicamente a `ViewMatrix`, permitindo ao usuário navegar pelos eixos $X$ e $Z$ (andar pela sala) e manipular o vetor *Up* para simular a inclinação da "cabeça" (eixo $Y$).

### 3. Modelo de Iluminação de Phong & Shaders (GLSL)
Desenvolvimento de *Vertex Shaders* e *Fragment Shaders* customizados processados diretamente na GPU para calcular interações físicas da luz:
* **Luz Ambiente:** Define o limiar base de sombreamento físico do cenário.
* **Luz Difusa Direcional:** Lâmpada principal em movimento contínuo no teto da sala que altera dinamicamente a face iluminada dos objetos.
* **Reflexo Especular:** Implementação avançada utilizando o cálculo vetorial de visão do observador (`u_EyePosition`) para gerar pontos de brilho metálico/vítreo (altamente visível no tampo da mesa redonda e no couro dos sofás).
* **Spotlight (Cone de Luz da TV):** Simulação matemática de um cone direcionado (`smoothstep`), calculando a atenuação da luz com a distância e incorporando uma função paramétrica de onda (`sin`) para simular a cintilação realista (*flicker*) de uma tela de TV transmitindo imagens.

### 4. Mapeamento de Texturas (Texture Mapping)
* Aplicação de coordenadas de textura (*UV Mapping*) em malhas tridimensionais, controlando repetições (`GL_REPEAT`) e interpolação bilinear de amostras de pixels em superfícies laminadas, papéis de parede, madeira e couro.

---

## 🕹️ Como Interagir com o Ambiente

| Tecla | Ação na Câmera / Ambiente |
| :---: | :--- |
| `↑` / `↓` | Movimenta-se para a frente e para trás na sala |
| `←` / `→` | Gira a visão do observador no próprio eixo |
| `W` / `S` | Inclina a visão (olhar para o teto ou chão) |
| `T` | Liga/Desliga a simulação de tela e emissão de luz azul da TV |
| `O` | Animação de abertura e fechamento das portas da estante |
| `1` / `2` | Animação interativa de translação contínua das cadeiras |

---

## 🔧 Como Executar Localmente

Devido às restrições de segurança padrão dos navegadores (CORS) para carregamento dinâmico de texturas assíncronas de arquivos locais, a aplicação **deve** ser executada sobre um servidor local.

1. Clone o repositório.
2. Inicie um servidor HTTP leve na raiz da pasta do projeto:
   * **Via Node.js:** `npx http-server`
3. Acesse `http://127.0.0.1:8080` no seu navegador.

