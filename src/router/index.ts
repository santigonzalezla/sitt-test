import express from "express";
import authentication from "./authentication";
import users from "./users";
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Función para convertir markdown simple a HTML
const markdownToHtml = (markdown: string): string =>
{
    return markdown
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/^\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/gim, '<br>')
        .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
        .replace(/<\/ul><br><ul>/gim, '');
};

router.get('/', (req, res) => {
    try {
        // Leer el archivo README.md
        const readmePath = path.join(__dirname, '../../README.md');
        let readmeContent = '';

        if (fs.existsSync(readmePath)) {
            readmeContent = fs.readFileSync(readmePath, 'utf-8');
        } else {
            // Fallback con el contenido básico
            readmeContent = `# SittTest API

Una API RESTful de autenticación construida con TypeScript, Express.js y MongoDB.

## 🔗 URL de Despliegue
**Base URL:** \`https://sitt-test-7w1u.vercel.app\`

## 📝 Endpoints Principales

### Autenticación
- \`POST /auth/register\` - Registro de usuario
- \`POST /auth/login\` - Inicio de sesión
- \`POST /auth/refresh\` - Renovar token
- \`POST /auth/validate\` - Validar token
- \`POST /auth/logout\` - Cerrar sesión

### Usuarios
- \`GET /users\` - Obtener todos los usuarios
- \`GET /users/:id\` - Obtener usuario por ID
- \`PATCH /users/:id\` - Actualizar usuario
- \`DELETE /users/:id\` - Eliminar usuario

## 📄 Documentación Completa
Visita \`/docs\` para la documentación interactiva con Swagger.

## 🔒 Autenticación
Incluye el token en el header: \`Authorization: Bearer <token>\``;
        }

        // Convertir markdown a HTML
        const htmlContent = markdownToHtml(readmeContent);

        // Responder con HTML
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SittTest API Documentation</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        max-width: 800px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        line-height: 1.6;
                        color: #333;
                    }
                    h1, h2, h3, h4, h5 { color: #2c3e50; }
                    code { 
                        background: #f4f4f4; 
                        padding: 2px 4px; 
                        border-radius: 3px; 
                        font-family: 'Monaco', 'Consolas', monospace;
                    }
                    pre { 
                        background: #f8f8f8; 
                        padding: 15px; 
                        border-radius: 5px; 
                        overflow-x: auto;
                        border-left: 4px solid #3498db;
                    }
                    ul { padding-left: 20px; }
                    li { margin: 5px 0; }
                    a { color: #3498db; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    .api-info {
                        background: #e8f4fd;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        border-left: 4px solid #3498db;
                    }
                </style>
            </head>
            <body>
                <div class="api-info">
                    <strong>🚀 API Status:</strong> Online<br>
                    <strong>📅 Timestamp:</strong> ${new Date().toISOString()}<br>
                    <strong>🏷️ Version:</strong> 1.0.0
                </div>
                ${htmlContent}
                <hr>
                <p><em>Para documentación interactiva, visita <a href="/docs">/docs</a></em></p>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error loading README:', error);
        res.status(200).json({
            message: "Welcome to SittTest API",
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            documentation: '/docs'
        });
    }
});

export default (): express.Router => {
    authentication(router);
    users(router);
    return router;
};