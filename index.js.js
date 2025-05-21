const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

/**
 * GET /pedidos?status=enviado
 */
app.get('/pedidos', async (req, res) => {
  const status = req.query.status;

  try {
    const response = await axios.get(`https://api.olist.com.br/pedidos?status=${status}`, {
      headers: {
        'Authorization': `Bearer ${process.env.OLIST_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const pedidos = response.data;
    res.json({ pedidos });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar pedidos no Olist' });
  }
});

/**
 * GET /resumo-vendas
 */
app.get('/resumo-vendas', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.tiny.com.br/api2/pedidos.pesquisa.php', {
      params: {
        token: process.env.TINY_API_TOKEN,
        formato: 'json'
      }
    });

    const pedidos = data.retorno.pedidos || [];
    const totalValor = pedidos.reduce((acc, cur) => acc + parseFloat(cur.pedido.valor), 0);
    const totalPedidos = pedidos.length;

    res.json({ totalPedidos, totalValor });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar resumo de vendas no Tiny' });
  }
});

/**
 * GET /cliente/top
 */
app.get('/cliente/top', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.tiny.com.br/api2/pedidos.pesquisa.php', {
      params: {
        token: process.env.TINY_API_TOKEN,
        formato: 'json'
      }
    });

    const pedidos = data.retorno.pedidos || [];
    const vendasPorCliente = {};

    pedidos.forEach(p => {
      const cliente = p.pedido.nome;
      const valor = parseFloat(p.pedido.valor);
      vendasPorCliente[cliente] = (vendasPorCliente[cliente] || 0) + valor;
    });

    const [clienteTop, totalComprado] = Object.entries(vendasPorCliente).sort((a, b) => b[1] - a[1])[0];
    res.json({ cliente: clienteTop, totalComprado });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar cliente top no Tiny' });
  }
});

/**
 * GET /produto/mais-vendido
 * (versão fictícia usando dados mockados – substitua por integração real depois)
 */
app.get('/produto/mais-vendido', async (req, res) => {
  try {
    // ⚠️ Aqui você deve implementar a lógica real com base nos itens dos pedidos
    const maisVendido = {
      produto: 'Papel Higiênico Sublime 16x4',
      quantidadeVendida: 215
    };

    res.json(maisVendido);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar produto mais vendido' });
  }
});

/**
 * Rota padrão
 */
app.get('/', (req, res) => {
  res.send('API funcionando - Jale Distribuidora 🚀');
});

/**
 * Inicia o servidor
 */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
