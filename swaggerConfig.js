
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'qBittorrent API',
    version: '1.0.0',
    description: 'API документация для управления торрентами',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Local server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./app.js'], // путь к файлу с ручками
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
