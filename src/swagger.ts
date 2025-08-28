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
                url: 'https://sitt-test-7w1u.vercel.app',
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
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: '65f8a1b2c3d4e5f6a7b8c9d0'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'usuario@ejemplo.com'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'string'
                        },
                        message: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Autenticación',
                description: 'Endpoints relacionados con la autenticación de usuarios'
            },
            {
                name: 'Usuarios',
                description: 'Endpoints para la gestión de usuarios'
            }
        ]
    },
    apis: [
        './src/router/*.ts',
        './public/src/router/*.js' // Para el código compilado en Vercel
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;