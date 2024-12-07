const express = require('express');
const app = express();
const { Pool } = require('pg'); // Requer a conexão com o banco

// Definindo o pool de conexão com o PostgreSQL
const pool = new Pool({
  user: 'mobile',
  host: 'dpg-ct9pqdjtq21c73brlt80-a.virginia-postgres.render.com',
  database: 'oscarapp',
  password: 'cLgGOzRxjOVrPmFUt936Vyg6l8PJ33pj',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,  // Permite conexões SSL sem verificar a autoridade de certificação
  }
});

// Teste de conexão com o banco de dados
pool.connect()
  .then(client => {
    console.log('Conexão bem-sucedida com o banco!');
    client.release();
  })
  .catch(err => {
    console.error('Erro de conexão com o banco:', err);
  });

// Definir uma rota simples
app.get('/', (req, res) => {
  res.send('Servidor Node.js rodando!');
});

// Rota para testar a conexão com o banco
app.get('/db-test', (req, res) => {
  pool.query('SELECT NOW()')
    .then(result => {
      res.send(`Banco de dados conectado: ${result.rows[0].now}`);
    })
    .catch(error => {
      res.status(500).send(`Erro ao conectar ao banco: ${error.message}`);
    });
});

// Configurar a porta
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
