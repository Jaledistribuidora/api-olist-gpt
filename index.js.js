const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/pedidos', async (req, res) => {
  const status = req.body.status;

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
app.get('/', (req, res) => {
  res.send('API funcionando - Jale Distribuidora 🚀');
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

