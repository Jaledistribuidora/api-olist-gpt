// ✅ Versão finalizada com tratamento robusto para todos os retornos da API Tiny

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const TINY_API_BASE = 'https://api.tiny.com.br/api2';
const TOKEN = process.env.TINY_API_TOKEN;
const FORMATO = 'json';

const urlEncodedHeaders = {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
};

app.get('/pedidos', async (req, res) => {
  try {
    const { status, data_inicial, data_final } = req.query;
    if (!status) return res.status(400).json({ error: 'Parâmetro "status" é obrigatório.' });

    const hoje = new Date();
    const dataFinal = data_final || hoje.toISOString().split('T')[0];
    const dataInicial = data_inicial || new Date(hoje.setDate(hoje.getDate() - 90)).toISOString().split('T')[0];

    const form = new URLSearchParams({
      token: TOKEN,
      formato: FORMATO,
      situacao: status,
      data_inicial: dataInicial,
      data_final: dataFinal
    });

    const { data } = await axios.post(`${TINY_API_BASE}/pedidos.pesquisa.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao buscar pedidos", detalhes: data.retorno.erros });
    }

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

app.get('/pedido/:numero', async (req, res) => {
  try {
    const { numero } = req.params;
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO, numero });
    const { data } = await axios.post(`${TINY_API_BASE}/pedido.obter.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao buscar pedido", detalhes: data.retorno.erros });
    }

    res.json(data.retorno.pedido);
  } catch (error) {
    console.error('[ERRO] /pedido:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter pedido.' });
  }
});

app.get('/contatos', async (req, res) => {
  try {
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO });
    const { data } = await axios.post(`${TINY_API_BASE}/contatos.pesquisa.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao consultar contatos", detalhes: data.retorno.erros });
    }

    const contatosTiny = data.retorno.contatos || [];
    const contatos = contatosTiny.map(c => ({
      nome: c.contato.nome,
      email: c.contato.email,
      cidade: c.contato.cidade,
      estado: c.contato.uf,
      situacao: c.contato.situacao
    }));

    res.json({ contatos });
  } catch (error) {
    console.error('[ERRO] /contatos:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar contatos.' });
  }
});

app.get('/produtos', async (req, res) => {
  try {
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO });
    const { data } = await axios.post(`${TINY_API_BASE}/produtos.pesquisa.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao buscar produtos", detalhes: data.retorno.erros });
    }

    res.json({ produtos: data.retorno.produtos || [] });
  } catch (error) {
    console.error('[ERRO] /produtos:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

app.get('/produto/estoque/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO, codigo });
    const { data } = await axios.post(`${TINY_API_BASE}/produto.obter.estoque.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao buscar estoque", detalhes: data.retorno.erros });
    }

    res.json(data.retorno.estoque);
  } catch (error) {
    console.error('[ERRO] /produto/estoque:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter estoque do produto.' });
  }
});

app.get('/crm', async (req, res) => {
  try {
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO });
    const { data } = await axios.post(`${TINY_API_BASE}/crm.pesquisa.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao buscar CRM", detalhes: data.retorno.erros });
    }

    res.json({ crms: data.retorno.assuntos || [] });
  } catch (error) {
    console.error('[ERRO] /crm:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao pesquisar CRM.' });
  }
});

app.get('/crm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO, id });
    const { data } = await axios.post(`${TINY_API_BASE}/crm.obter.assunto.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao buscar assunto CRM", detalhes: data.retorno.erros });
    }

    res.json(data.retorno.assunto);
  } catch (error) {
    console.error('[ERRO] /crm/:id:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter assunto do CRM.' });
  }
});

app.get('/notas', async (req, res) => {
  try {
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO });
    const { data } = await axios.post(`${TINY_API_BASE}/notas.fiscais.pesquisa.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao buscar notas fiscais", detalhes: data.retorno.erros });
    }

    res.json({ notas: data.retorno.notas_fiscais || [] });
  } catch (error) {
    console.error('[ERRO] /notas:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar notas fiscais.' });
  }
});

app.get('/nota/:numero', async (req, res) => {
  try {
    const { numero } = req.params;
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO, numero });
    const { data } = await axios.post(`${TINY_API_BASE}/nota.fiscal.obter.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao obter nota fiscal", detalhes: data.retorno.erros });
    }

    res.json(data.retorno.nota_fiscal);
  } catch (error) {
    console.error('[ERRO] /nota/:numero:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter nota fiscal.' });
  }
});

app.get('/nota/:numero/xml', async (req, res) => {
  try {
    const { numero } = req.params;
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO, numero });
    const { data } = await axios.post(`${TINY_API_BASE}/nota.fiscal.obter.xml.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao obter XML da nota", detalhes: data.retorno.erros });
    }

    res.json(data.retorno.xml);
  } catch (error) {
    console.error('[ERRO] /nota/:numero/xml:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter XML da nota.' });
  }
});

app.get('/nota/:numero/link', async (req, res) => {
  try {
    const { numero } = req.params;
    const form = new URLSearchParams({ token: TOKEN, formato: FORMATO, numero });
    const { data } = await axios.post(`${TINY_API_BASE}/nota.fiscal.obter.link.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status !== "OK") {
      return res.status(500).json({ error: "Erro ao obter link da nota", detalhes: data.retorno.erros });
    }

    res.json({ link: data.retorno.link_nota_fiscal });
  } catch (error) {
    console.error('[ERRO] /nota/:numero/link:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter link da nota fiscal.' });
  }
});

app.get('/', (req, res) => {
  res.send('API Tiny integrada - Jale Distribuidora 🚀');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
