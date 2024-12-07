const express = require('express');
const { Pool } = require('pg');

// Configuração do pool de conexões com o banco de dados PostgreSQL no Render
const pool = new Pool({
  user: 'mobile',
  host: 'dpg-ct9pqdjtq21c73brlt80-a.virginia-postgres.render.com',
  database: 'oscarapp',
  password: 'cLgGOzRxjOVrPmFUt936Vyg6l8PJ33pj',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,  // Necessário para conexão com SSL
  },
});

// Inicializar o app do Express
const app = express();
app.use(express.json()); // Para que o Express consiga parsear o corpo da requisição como JSON

// Endpoint POST para inserir dados na tabela "dados"
app.post('/addData', async (req, res) => {
  const { nome } = req.body; // Espera o campo "nome" no corpo da requisição

  // Verificar se o nome foi fornecido
  if (!nome) {
    return res.status(400).json({ error: 'O campo nome é obrigatório.' });
  }

  try {
    const query = 'INSERT INTO dados (nome) VALUES ($1) RETURNING *';
    const values = [nome];

    const result = await pool.query(query, values);  // Executa a query no banco de dados
    res.status(201).json({ message: 'Data inserted successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
    res.status(500).json({ error: 'Erro ao inserir dados' });
  }
});

// Endpoint GET para buscar dados da tabela "dados"
app.get('/getData', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dados');  // Consulta para buscar todos os dados
    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
