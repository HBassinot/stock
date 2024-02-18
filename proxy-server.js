const express = require('express');
const axios = require('axios');

const app = express();
const port = 8000;

// Middleware pour permettre l'accès CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Route pour appeler le web service tiers
app.get('/stock/price/:stock', async (req, res) => {
  const stock = req.params.stock;
  try {
    // Appel du web service tiers
    stocksplit = stock.split(":")[0];
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${stocksplit}`);
    
    // Récupération du prix de l'action depuis la réponse
    const prix = response.data.chart.result[0].meta.regularMarketPrice;

    // Envoi du prix de l'action en réponse
    res.json({ prix });
  } catch (error) {
    console.error('Erreur lors de la récupération du prix de l\'action :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du prix de l\'action' });
  }
});

// Route pour appeler le web service tiers
app.get('/currency/:currency', async (req, res) => {
  const currency = req.params.currency;
  try {
    // Appel du web service tiers
    currencysplit = currency.split(":")[0];
    const response = await axios.get(`https://query1.finance.yahoo.com/v7/finance/spark?symbols=${currencysplit}%3DX`);
    
    // Récupération du prix de l'action depuis la réponse
    const prix = response.data.spark.result[0].response[0].meta.regularMarketPrice;

    // Envoi du prix de l'action en réponse
    res.json({ prix });
  } catch (error) {
    console.error('Erreur lors de la récupération du prix de l\'action :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du prix de l\'action' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
