import fs from "fs";
import path from "path";

const targetDir = path.join(process.cwd(), "imported_stitch_design");

// Mapeamento dos arquivos hash para nomes amigáveis
const fileMap = {
  "screen_362b9a7c0c59427db4248127a5d1a5b6.html": "index.html",
  "screen_3e9c38f80f8b4e5e9af27cfade1c1af8.html": "shop.html",
  "screen_039f2ef24fc544169d440ca651a664cd.html": "product.html",
  "screen_3e17fa1757004d53b4792dc3febcf92b.html": "about.html",
  "screen_fe43861665be464387c5f777e2dcbafe.html": "cart.html",
};

// Outros hashes equivalentes (como duplicatas) que devem redirecionar para a home
const fallbackRedirects = {
  "screen_35042c60141c4b968f6afdab73e65fcc.html": "index.html",
};

function run() {
  console.log("Organizando arquivos HTML e consertando links...");

  // 1. Copiar arquivos com os novos nomes amigáveis
  for (const [oldName, newName] of Object.entries(fileMap)) {
    const oldPath = path.join(targetDir, oldName);
    const newPath = path.join(targetDir, newName);

    if (fs.existsSync(oldPath)) {
      fs.copyFileSync(oldPath, newPath);
      console.log(`- Copiado: ${oldName} -> ${newName}`);
    } else {
      console.warn(`Aviso: Arquivo de origem ${oldName} não encontrado.`);
    }
  }

  // 2. Ajustar links e navegação em cada arquivo novo
  const activeFiles = Object.values(fileMap);

  for (const file of activeFiles) {
    const filePath = path.join(targetDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, "utf-8");

    // Adicionar IDs a seções da home para âncoras funcionarem
    if (file === "index.html") {
      content = content.replace(
        'class="py-section-gap bg-jet-black border-y border-white/5"',
        'id="community" class="py-section-gap bg-jet-black border-y border-white/5"'
      );
    }

    // Substituir links antigos para as novas páginas correspondentes
    for (const [oldName, newName] of Object.entries(fileMap)) {
      content = content.replaceAll(oldName, newName);
    }
    for (const [oldName, newName] of Object.entries(fallbackRedirects)) {
      content = content.replaceAll(oldName, newName);
    }

    // --- CORREÇÕES NA BARRA DE NAVEGAÇÃO SUPERIOR (TopNavBar) ---

    // 1. Tornar o logotipo "MANSÃO MAROMBA" clicável e direcionar para a Home
    content = content.replace(
      /<div class="text-headline-md font-headline-md font-black text-primary italic dark:text-neon-yellow">\s*MANSÃO MAROMBA\s*<\/div>/g,
      `<a href="index.html" class="text-headline-md font-headline-md font-black text-primary italic dark:text-neon-yellow hover:opacity-80 transition-opacity">MANSÃO MAROMBA</a>`
    );

    // 2. Mapear links de texto da navegação de desktop
    content = content.replace(
      /<a class="([^"]*)" href="#">SHOP<\/a>/g,
      `<a class="$1" href="shop.html">SHOP</a>`
    );
    content = content.replace(
      /<a class="([^"]*)" href="#">FLAVORS<\/a>/g,
      `<a class="$1" href="index.html">FLAVORS</a>`
    );
    content = content.replace(
      /<a class="([^"]*)" href="#">DAMAGE REDUCTION<\/a>/g,
      `<a class="$1" href="about.html">DAMAGE REDUCTION</a>`
    );
    content = content.replace(
      /<a class="([^"]*)" href="#">HYPE<\/a>/g,
      `<a class="$1" href="index.html#community">HYPE</a>`
    );

    // 3. Mapear botões e ícones do carrinho de compras na navegação
    // Substitui o botão do carrinho de compras por um link direto para cart.html
    content = content.replace(
      /<button class="hover:bg-white\/5 transition-all duration-300 p-2 rounded scale-95 active:scale-90 transition-transform">\s*<span class="material-symbols-outlined text-primary dark:text-neon-yellow">shopping_cart<\/span>\s*<\/button>/g,
      `<a href="cart.html" class="hover:bg-white/5 transition-all duration-300 p-2 rounded scale-95 active:scale-90 transition-transform flex items-center justify-center"><span class="material-symbols-outlined text-primary dark:text-neon-yellow">shopping_cart</span></a>`
    );
    content = content.replace(
      /<span class="material-symbols-outlined cursor-pointer hover:bg-white\/5 transition-all duration-300 p-2 rounded-full" data-icon="shopping_cart">shopping_cart<\/span>/g,
      `<a href="cart.html" class="hover:bg-white/5 transition-all duration-300 p-2 rounded-full flex items-center justify-center active:scale-95 transition-transform"><span class="material-symbols-outlined text-primary dark:text-neon-yellow">shopping_cart</span></a>`
    );
    content = content.replace(
      /<span class="material-symbols-outlined cursor-pointer hover:bg-white\/5 transition-all duration-300 p-2 rounded-full" data-icon="shopping_bag">shopping_bag<\/span>/g,
      `<a href="cart.html" class="hover:bg-white/5 transition-all duration-300 p-2 rounded-full flex items-center justify-center active:scale-95 transition-transform"><span class="material-symbols-outlined text-primary dark:text-neon-yellow">shopping_cart</span></a>`
    );

    // --- CORREÇÕES NA BARRA DE NAVEGAÇÃO DE CELULAR (BottomNavBar) ---
    // Substitui as âncoras na navegação mobile inferior
    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined" data-icon="bolt">bolt<\/span>\s*<span class="text-label-caps font-label-caps mt-1">Shop<\/span>\s*<\/a>/gi,
      `<a class="$1" href="shop.html"><span class="material-symbols-outlined" data-icon="bolt">bolt</span><span class="text-label-caps font-label-caps mt-1">Shop</span></a>`
    );
    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined">bolt<\/span>\s*<span class="text-label-caps font-label-caps text-\[10px\] uppercase">Shop<\/span>\s*<\/a>/gi,
      `<a class="$1" href="shop.html"><span class="material-symbols-outlined">bolt</span><span class="text-label-caps font-label-caps text-[10px] uppercase">Shop</span></a>`
    );

    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined" data-icon="shield_heart">shield_with_heart<\/span>\s*<span class="text-label-caps font-label-caps mt-1">Damage<\/span>\s*<\/a>/gi,
      `<a class="$1" href="about.html"><span class="material-symbols-outlined" data-icon="shield_heart">shield_with_heart</span><span class="text-label-caps font-label-caps mt-1">Damage</span></a>`
    );
    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined">shield_with_heart<\/span>\s*<span class="text-label-caps font-label-caps text-\[10px\] uppercase">Damage<\/span>\s*<\/a>/gi,
      `<a class="$1" href="about.html"><span class="material-symbols-outlined">shield_with_heart</span><span class="text-label-caps font-label-caps text-[10px] uppercase">Damage</span></a>`
    );

    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined" data-icon="groups">groups<\/span>\s*<span class="text-label-caps font-label-caps mt-1">Community<\/span>\s*<\/a>/gi,
      `<a class="$1" href="index.html#community"><span class="material-symbols-outlined" data-icon="groups">groups</span><span class="text-label-caps font-label-caps mt-1">Community</span></a>`
    );
    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined">groups<\/span>\s*<span class="text-label-caps font-label-caps text-\[10px\] uppercase">Community<\/span>\s*<\/a>/gi,
      `<a class="$1" href="index.html#community"><span class="material-symbols-outlined">groups</span><span class="text-label-caps font-label-caps text-[10px] uppercase">Community</span></a>`
    );

    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined" data-icon="shopping_bag">shopping_bag<\/span>\s*<span class="text-label-caps font-label-caps mt-1">Cart<\/span>\s*<\/a>/gi,
      `<a class="$1" href="cart.html"><span class="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span><span class="text-label-caps font-label-caps mt-1">Cart</span></a>`
    );
    content = content.replace(
      /<a class="([^"]*)" href="#">\s*<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">shopping_bag<\/span>\s*<span class="text-label-caps font-label-caps text-\[10px\] uppercase">Cart<\/span>\s*<\/a>/gi,
      `<a class="$1" href="cart.html"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">shopping_bag</span><span class="text-label-caps font-label-caps text-[10px] uppercase">Cart</span></a>`
    );

    // --- CORREÇÕES EM BOTÕES GERAIS E LINKS DE PRODUTO ---
    // Faz o botão "COMPRAR AGORA" da home redirecionar para a loja
    content = content.replace(
      /COMPRAR AGORA<\/button>/g,
      'COMPRAR AGORA</button></a>'
    ).replace(
      /<button class="bg-neon-yellow text-jet-black px-12 py-4 font-black text-xl uppercase tracking-tighter hover:bg-white transition-all transform active:scale-95">\s*COMPRAR AGORA/g,
      '<a href="shop.html"><button class="bg-neon-yellow text-jet-black px-12 py-4 font-black text-xl uppercase tracking-tighter hover:bg-white transition-all transform active:scale-95">COMPRAR AGORA'
    );

    // Faz os produtos da home linkarem para a página do produto específico ao clicar
    content = content.replace(
      /<div class="bg-dark-grey aspect-\[3\/4\] relative overflow-hidden mb-6">\s*<img alt="Goro Original"/g,
      '<a href="product.html"><div class="bg-dark-grey aspect-[3/4] relative overflow-hidden mb-6"><img alt="Goro Original"'
    );
    // Fecha a tag a
    content = content.replace(
      /<\/div>\s*<div class="flex justify-between items-start">\s*<div>\s*<h3 class="font-headline-md text-headline-md mb-1 uppercase tracking-tighter">GORO ORIGINAL<\/h3>/g,
      '</div></a><div class="flex justify-between items-start"><div><h3 class="font-headline-md text-headline-md mb-1 uppercase tracking-tighter">GORO ORIGINAL</h3>'
    );

    // Adicionar link para a página do produto na imagem e títulos da loja
    if (file === "shop.html") {
      // Adiciona link para product.html nos itens do grid da loja
      content = content.replaceAll(
        'href="#"',
        'href="product.html"'
      );
    }

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`- Atualizado links em: ${file}`);
  }

  console.log("\nOrganização concluída! A página inicial agora está disponível como 'index.html'.");
}

run();
