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

app.get('/votos/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM votos WHERE token = $1', [token]);
    client.release();

    if (rows.length > 0) {
      res.json(rows[0]); // Retorna o voto encontrado
    } else {
      res.status(404).json({ message: 'Voto não encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar o voto' });
  }
});

app.post('/votos', async (req, res) => {
  const { usuario, token, filmeId, diretorId } = req.body;

  try {
    // Verifica se o usuário já votou neste filme e diretor
    const checkVoteQuery = 'SELECT EXISTS(SELECT 1 FROM votos WHERE token = $1)';
    const checkVoteResult = await pool.query(checkVoteQuery, [token]);
    // Verifica se o usuário é válido
    const checkUserQuery = 'SELECT usuario FROM tokens WHERE token = $1';
    const checkUserResult = await pool.query(checkUserQuery, [token]);

    if (checkUserResult.rows.length === 0 || checkUserResult.rows[0].usuario !== usuario) {
      return res.status(401).json({ error: 'Token inválido ou usuário não autorizado.' });
    }

    if (checkVoteResult.rows[0].exists) {
      // Usuário já votou
      return res.status(400).json({ error: 'Você já exerceu seu direito a voto.' });
    }

    // Insere o voto
    const insertVoteQuery = 'INSERT INTO votos (token, filme_id, diretor_id) VALUES ($1, $2, $3)';
    await pool.query(insertVoteQuery, [token, filmeId, diretorId]);

    res.status(201).json({ message: 'Voto registrado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar o voto.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Verificar credenciais no banco de dados
  const query = 'SELECT * FROM usuarios WHERE nome_usuario = $1 AND senha = $2';
  const result = await pool.query(query, [username, password]);

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const getUserTokenQuery = 'SELECT token FROM tokens WHERE usuario_id = $1';
  const getUserTokenResult = await pool.query(getUserTokenQuery, [result.rows[0].id]);
  if (getUserTokenResult.rows.length > 0) {
    // Usuário já possui um token, retorna o token existente
    res.json({ token: getUserTokenResult.rows[0].token });
  } else {
    // Usuário não possui token, gera um novo token
    let token;
    let tokenExists = true;

    while (tokenExists) {
      token = Math.floor(Math.random() * 101);
      const checkTokenQuery = 'SELECT * FROM tokens WHERE token = $1';
      const checkTokenResult = await pool.query(checkTokenQuery, [token]);
      tokenExists = checkTokenResult.rows.length > 0;
    }
    // Salvar o token no banco de dados (tabela 'tokens')
    await pool.query('INSERT INTO tokens (usuario_id, token, usuario) VALUES ($1, $2, $3)', [result.rows[0].id, token, username]);

    res.json({ token });
  }
});

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
