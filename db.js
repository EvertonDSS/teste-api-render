const { Pool } = require('pg');

// URL de conexão fornecida pelo Render
const pool = new Pool({
  user: 'mobile', // Nome do usuário
  host: 'dpg-ct9pqdjtq21c73brlt80-a.virginia-postgres.render.com', // Host fornecido pelo Render
  database: 'oscarapp', // Nome do banco de dados
  password: 'cLgGOzRxjOVrPmFUt936Vyg6l8PJ33pj', // Senha fornecida pelo Render
  port: 5432, // Porta padrão do PostgreSQL
});

// Função para testar a conexão
pool.connect()
  .then(client => {
    console.log('Conexão bem-sucedida com o banco!');
    client.release();
  })
  .catch(err => {
    console.error('Erro de conexão com o banco:', err);
  });
