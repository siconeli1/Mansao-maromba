# Mansao Maromba

Mansao Maromba é uma pagina web criada como atividade pratica durante a minha jornada no curso do SENAI: **Desenvolvimento de aplicacoes de IA generativa utilizando Google Antigravity**.

O objetivo da atividade foi gerar um layout/tema usando o **Google Stitch**, importar esse material para o **Google Antigravity** e, a partir disso, gerar uma pagina web.

## Sobre o projeto

O projeto apresenta uma interface visual para a marca ficticia Mansao Maromba, com paginas estaticas em HTML geradas a partir do tema importado.

As paginas principais ficam na pasta:

```text
imported_stitch_design/
```

## Como abrir

Voce pode abrir diretamente o arquivo principal no navegador:

```text
imported_stitch_design/index.html
```

Ou, se preferir rodar com um servidor local:

```powershell
npx serve imported_stitch_design
```

Depois, acesse o endereco exibido no terminal, como:

```text
http://localhost:3000
```

## Tecnologias e ferramentas

- HTML
- Tailwind CSS via CDN
- Google Stitch
- Google Antigravity
- Node.js para scripts auxiliares de importacao e organizacao

## Estrutura

```text
.
+-- imported_stitch_design/
|   +-- index.html
|   +-- shop.html
|   +-- product.html
|   +-- about.html
|   +-- cart.html
+-- import_stitch.js
+-- organize_frontend.js
+-- package.json
+-- README.md
```
