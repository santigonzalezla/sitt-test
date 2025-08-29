import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SittTest API',
            version: '1.0.0',
            description: 'API RESTful de autenticación con TypeScript, Express.js y MongoDB',
            contact: {
                name: 'Santiago González',
                email: 'santigonzalezla@github.com'
            }
        },
        servers: [
            {
                url: 'https://sitt-test.vercel.app',
                description: 'Servidor de producción'
            },
            {
                url: 'http://localhost:4000',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingresa tu JWT token en el formato: Bearer <token>'
                }
            }
        },
        tags: [
            {
                name: 'Autenticación',
                description: 'Endpoints para manejo de autenticación de usuarios'
            },
            {
                name: 'Usuarios',
                description: 'Endpoints para manejo de usuarios'
            }
        ]
    },
    apis: [
        './src/router/*.ts'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;