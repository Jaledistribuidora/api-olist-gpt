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

    const hoje = new Date();
    const dataFinal = data_final || hoje.toISOString().split('T')[0];
    const dataInicial = data_inicial || new Date(hoje.setDate(hoje.getDate() - 90)).toISOString().split('T')[0];

    const form = new URLSearchParams({
      token: TOKEN,
      formato: FORMATO,
      data_inicial: dataInicial,
      data_final: dataFinal
    });

    // Só inclui o status se for informado
    if (status) form.append('situacao', status);

    const { data } = await axios.post(`${TINY_API_BASE}/pedidos.pesquisa.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status === "Erro") {
      const erroMsg = data.retorno.erros?.[0]?.erro || "Erro desconhecido";
      if (erroMsg.toLowerCase().includes("token")) {
        return res.status(401).json({ error: "Token inválido. Verifique suas credenciais da API do Tiny." });
      } else if (erroMsg.toLowerCase().includes("não retornou registros")) {
        return res.status(200).json({ pedidos: [], mensagem: "Nenhum pedido encontrado com os filtros aplicados." });
      } else {
        return res.status(500).json({ error: erroMsg });
      }
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

app.get('/pedido/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const form = new URLSearchParams({
      token: TOKEN,
      formato: FORMATO,
      id
    });

    const { data } = await axios.post(`${TINY_API_BASE}/pedido.obter.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status === "Erro") {
      const erroMsg = data.retorno.erros?.[0]?.erro || "Erro desconhecido";
      if (erroMsg.toLowerCase().includes("token")) {
        return res.status(401).json({ error: "Token inválido. Verifique suas credenciais da API do Tiny." });
      } else if (erroMsg.toLowerCase().includes("pedido não localizado")) {
        return res.status(404).json({ mensagem: "Pedido não localizado com esse ID." });
      } else {
        return res.status(500).json({ error: erroMsg });
      }
    }

    const p = data.retorno.pedido;

    const pedidoFormatado = {
      numero: p.numero,
      data: p.data_pedido,
      total: p.total_pedido,
      cliente: p.cliente?.nome || "N/D",
      status: p.situacao,
      frete: p.valor_frete,
      itens: (p.itens || []).map(i => ({
        descricao: i.item.descricao,
        quantidade: Number(i.item.quantidade),
        valor_unitario: Number(i.item.valor_unitario)
      })),
      parcelas: (p.parcelas || []).map(parcela => ({
        data: parcela.parcela.data,
        valor: Number(parcela.parcela.valor)
      })),
      rastreio: p.codigo_rastreamento ? {
        codigo: p.codigo_rastreamento,
        url: p.url_rastreamento
      } : null
    };

    res.json(pedidoFormatado);

  } catch (error) {
    console.error('[ERRO] /pedido/:id:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao consultar detalhes do pedido.' });
  }
});

app.get('/pedido/numero/:numero', async (req, res) => {
  try {
    const { numero } = req.params;
    const form = new URLSearchParams({
      token: TOKEN,
      formato: FORMATO,
      numero
    });

    const { data } = await axios.post(`${TINY_API_BASE}/pedidos.pesquisa.php`, form.toString(), urlEncodedHeaders);

    if (data.retorno.status === "Erro") {
      const erroMsg = data.retorno.erros?.[0]?.erro || "Erro desconhecido";
      if (erroMsg.toLowerCase().includes("token")) {
        return res.status(401).json({ error: "Token inválido. Verifique suas credenciais da API do Tiny." });
      } else {
        return res.status(404).json({ mensagem: "Pedido não encontrado com esse número." });
      }
    }

    const pedidos = data.retorno.pedidos || [];
    if (pedidos.length === 0) {
      return res.status(404).json({ mensagem: "Pedido não localizado." });
    }

    const pedido = pedidos[0].pedido;
    res.json(pedido);

  } catch (error) {
    console.error('[ERRO] /pedido/numero/:numero', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao consultar pedido por número.' });
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
