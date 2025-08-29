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
                url: 'https://sitt-test.vercel.app/api',
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
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'auth-token',
                    description: 'Token de autenticación en cookie'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'username'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID único del usuario'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario'
                        },
                        username: {
                            type: 'string',
                            description: 'Nombre de usuario'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'password123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Login exitoso'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT Token'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        code: {
                            type: 'string',
                            example: 'ERROR_CODE'
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Token de acceso faltante o inválido',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Recurso no encontrado',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
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
    // Para desarrollo TypeScript
    apis: [
        './src/router/*.ts',          // Archivos TypeScript en desarrollo
        './src/controllers/*.ts',     // Controladores TypeScript
        './api/*.ts',                 // API routes TypeScript
        './src/router/index.ts',      // Router principal TypeScript
        './src/router/*.js',          // Fallback para archivos compilados
        './src/controllers/*.js',     // Fallback compilados
        './api/*.js'                  // Fallback compilados
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;