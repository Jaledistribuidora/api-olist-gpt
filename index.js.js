const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const TINY_API_BASE = 'https://api.tiny.com.br/api2';
const TOKEN = process.env.TINY_API_TOKEN;
const FORMATO = 'json';

// 🚚 Pesquisar pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const { status } = req.query;
    const { data } = await axios.get(`${TINY_API_BASE}/pedidos.pesquisa.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO,
        situacao: status
      }
    });

    const pedidos = (data.retorno.pedidos || []).map(p => ({
      numero: p.pedido.numero,
      cliente: p.pedido.nome,
      valor: parseFloat(p.pedido.valor),
      data: p.pedido.data_pedido,
      status: p.pedido.situacao
    }));

    res.json({ pedidos });
  } catch (error) {
    console.error('[ERRO] /pedidos:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// 🔍 Obter detalhes de um pedido específico
app.get('/pedido/:numero', async (req, res) => {
  try {
    const { numero } = req.params;
    const { data } = await axios.get(`${TINY_API_BASE}/pedido.obter.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO,
        numero
      }
    });

    res.json(data.retorno.pedido);
  } catch (error) {
    console.error('[ERRO] /pedido:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter pedido.' });
  }
});

// 👤 Pesquisar contatos
app.get('/contatos', async (req, res) => {
  try {
    const { data } = await axios.get(`${TINY_API_BASE}/contatos.pesquisa.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO
      }
    });

    res.json({ contatos: data.retorno.contatos || [] });
  } catch (error) {
    console.error('[ERRO] /contatos:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar contatos.' });
  }
});

// 📦 Pesquisar produtos
app.get('/produtos', async (req, res) => {
  try {
    const { data } = await axios.get(`${TINY_API_BASE}/produtos.pesquisa.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO
      }
    });

    res.json({ produtos: data.retorno.produtos || [] });
  } catch (error) {
    console.error('[ERRO] /produtos:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

// 📊 Obter estoque de um produto
app.get('/produto/estoque/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { data } = await axios.get(`${TINY_API_BASE}/produto.obter.estoque.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO,
        codigo
      }
    });

    res.json(data.retorno.estoque);
  } catch (error) {
    console.error('[ERRO] /produto/estoque:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter estoque do produto.' });
  }
});

// 🧠 Pesquisar assuntos CRM
app.get('/crm', async (req, res) => {
  try {
    const { data } = await axios.get(`${TINY_API_BASE}/crm.pesquisa.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO
      }
    });

    res.json({ crms: data.retorno.assuntos || [] });
  } catch (error) {
    console.error('[ERRO] /crm:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao pesquisar CRM.' });
  }
});

// 📄 Obter assunto CRM específico
app.get('/crm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(`${TINY_API_BASE}/crm.obter.assunto.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO,
        id
      }
    });

    res.json(data.retorno.assunto);
  } catch (error) {
    console.error('[ERRO] /crm/:id:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter assunto do CRM.' });
  }
});

// 🧾 Pesquisar notas fiscais
app.get('/notas', async (req, res) => {
  try {
    const { data } = await axios.get(`${TINY_API_BASE}/notas.fiscais.pesquisa.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO
      }
    });

    res.json({ notas: data.retorno.notas_fiscais || [] });
  } catch (error) {
    console.error('[ERRO] /notas:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar notas fiscais.' });
  }
});

// 📄 Obter detalhes de uma nota fiscal
app.get('/nota/:numero', async (req, res) => {
  try {
    const { numero } = req.params;
    const { data } = await axios.get(`${TINY_API_BASE}/nota.fiscal.obter.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO,
        numero
      }
    });

    res.json(data.retorno.nota_fiscal);
  } catch (error) {
    console.error('[ERRO] /nota/:numero:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter nota fiscal.' });
  }
});

// 📥 Obter XML da nota fiscal
app.get('/nota/:numero/xml', async (req, res) => {
  try {
    const { numero } = req.params;
    const { data } = await axios.get(`${TINY_API_BASE}/nota.fiscal.obter.xml.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO,
        numero
      }
    });

    res.json(data.retorno.xml);
  } catch (error) {
    console.error('[ERRO] /nota/:numero/xml:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter XML da nota.' });
  }
});

// 🔗 Obter link da nota fiscal
app.get('/nota/:numero/link', async (req, res) => {
  try {
    const { numero } = req.params;
    const { data } = await axios.get(`${TINY_API_BASE}/nota.fiscal.obter.link.php`, {
      params: {
        token: TOKEN,
        formato: FORMATO,
        numero
      }
    });

    res.json({ link: data.retorno.link_nota_fiscal });
  } catch (error) {
    console.error('[ERRO] /nota/:numero/link:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter link da nota fiscal.' });
  }
});

// 🔍 Rota de verificação da API
app.get('/', (req, res) => {
  res.send('API Tiny integrada - Jale Distribuidora 🚀');
});

// ▶️ Inicializa servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

