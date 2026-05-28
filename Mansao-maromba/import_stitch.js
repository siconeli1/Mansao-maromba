import { stitch } from "@google/stitch-sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const apiKey = process.env.STITCH_API_KEY;
if (!apiKey) {
  console.error("Erro: STITCH_API_KEY não foi encontrada no arquivo .env");
  process.exit(1);
}

// Configura o SDK do Stitch com a chave de API
stitch.apiKey = apiKey; // De acordo com as diretrizes do SDK ou o env é carregado automaticamente

async function run() {
  try {
    console.log("Conectando ao Google Stitch...");
    const projects = await stitch.projects();
    console.log(`Encontrados ${projects.length} projetos.`);

    const targetProjectName = "Sabor Energético Digital Store";
    let targetProject = null;

    for (const project of projects) {
      console.log(`- Projeto encontrado: ID: ${project.id || project.projectId}`);
      // Tentando identificar o projeto por ID ou buscando informações
      // Como o objeto de projeto pode ter um ID ou título, vamos buscar os detalhes do projeto
      try {
        const details = await stitch.project(project.projectId || project.id).get();
        console.log(`  Nome detalhado: ${details.name || details.title || 'Sem Nome'}`);
        if (
          (details.name && details.name.toLowerCase().includes("sabor")) ||
          (details.title && details.title.toLowerCase().includes("sabor"))
        ) {
          targetProject = project;
          console.log(`>> Projeto alvo "${targetProjectName}" identificado!`);
          break;
        }
      } catch (err) {
        // Se falhar ao pegar detalhes diretos, tentamos comparar o próprio ID/objeto
        if (project.id && project.id.toLowerCase().includes("sabor")) {
          targetProject = project;
          console.log(`>> Projeto alvo "${targetProjectName}" identificado pelo ID!`);
          break;
        }
      }
    }

    if (!targetProject && projects.length > 0) {
      // Se não encontramos por correspondência de nome, mas temos projetos, pegamos o primeiro para testar ou deixamos o usuário ver
      console.log("\nProjetos disponíveis:");
      projects.forEach((p, idx) => console.log(`${idx + 1}. ID: ${p.id || p.projectId}`));
      console.log("\nTentando usar o primeiro projeto como padrão...");
      targetProject = projects[0];
    }

    if (!targetProject) {
      console.error("Erro: Nenhum projeto encontrado no Stitch com a chave fornecida.");
      process.exit(1);
    }

    const projectId = targetProject.projectId || targetProject.id;
    console.log(`\nAcessando projeto: ${projectId}`);
    const activeProject = stitch.project(projectId);
    
    console.log("Buscando telas (screens)...");
    const screens = await activeProject.screens();
    console.log(`Total de telas encontradas: ${screens.length}`);

    const outputDir = path.join(process.cwd(), "imported_stitch_design");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const screen of screens) {
      const screenId = screen.screenId || screen.id;
      const screenName = screen.name || screen.title || `screen-${screenId}`;
      console.log(`\nProcessando tela: "${screenName}" (ID: ${screenId})`);

      try {
        // Obter URL do HTML
        const htmlUrl = await screen.getHtml();
        if (htmlUrl) {
          console.log(`  Baixando HTML de: ${htmlUrl}`);
          const response = await fetch(htmlUrl);
          const htmlContent = await response.text();
          
          const filename = `${screenName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
          fs.writeFileSync(path.join(outputDir, filename), htmlContent, "utf-8");
          console.log(`  Salvo como: ${filename}`);
        } else {
          console.log("  Nenhum HTML disponível para esta tela.");
        }
      } catch (err) {
        console.error(`  Erro ao baixar HTML da tela ${screenName}:`, err.message);
      }

      try {
        // Obter URL da Imagem (opcional, para visualização)
        const imageUrl = await screen.getImage();
        if (imageUrl) {
          console.log(`  URL da Imagem da tela: ${imageUrl}`);
        }
      } catch (err) {
        console.error(`  Erro ao obter URL da imagem:`, err.message);
      }
    }

    console.log("\nImportação concluída com sucesso! Os arquivos estão na pasta 'imported_stitch_design'.");
  } catch (error) {
    console.error("Ocorreu um erro durante a importação:", error);
  }
}

run();
