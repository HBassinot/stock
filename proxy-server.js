const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 443;

// Chemin vers le fichier JSON
const stocksPath = './public/config.json';

// Middleware pour permettre l'accès CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Options pour le serveur HTTPS (certificat auto-signé à des fins de test)
const httpsOptions = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
};


// Route pour appeler le web service tiers
app.get('/portfolio/values', async (req, res) => {
  let portfoliosValue = [];

  // Lecture du fichier JSON
  const objetJSON = require(stocksPath);
  if (objetJSON) {
    console.log("Contenu du fichier JSON:", objetJSON);
  } else {
    console.log("Les données JSON ne sont pas encore disponibles.");
  }

  for (const portfolio of objetJSON.portfolios) {
    let portfolioValue = {};
    var totalPortfolioPrice = 0;

    for (const action of portfolio.actions) {
      let cur = 1;
      const stockPrice = await getStockPrice(action.nom);
      if(stockPrice.currency != "CAD") {
        const currencyPrice = await getCurrencyPrice(stockPrice.currency+"CAD");
        cur = currencyPrice.price;
      }

      totalPortfolioPrice += stockPrice.price * cur * action.quantite;
    }
    portfolioValue = {[portfolio.name] : totalPortfolioPrice};
    portfoliosValue.push(portfolioValue);
  }

  res.json(portfoliosValue);
});



// Route pour appeler le web service tiers
app.get('/portfolio/total', async (req, res) => {
  var totalStockPrice = 0;

  // Lecture du fichier JSON
  const objetJSON = require(stocksPath);
  if (objetJSON) {
    console.log("Contenu du fichier JSON:", objetJSON);
  } else {
    console.log("Les données JSON ne sont pas encore disponibles.");
  }

  for (const portfolio of objetJSON.portfolios) {
    for (const action of portfolio.actions) {
      let cur = 1;
      const stockPrice = await getStockPrice(action.nom);
      if(stockPrice.currency != "CAD") {
        const currencyPrice = await getCurrencyPrice(stockPrice.currency+"CAD");
        cur = currencyPrice.price;
      }

      totalStockPrice += stockPrice.price * cur * action.quantite;
    }
  }

  res.json(totalStockPrice);
});


// Route ou service utilisant la fonction getStockPrice
app.get('/stock/price/:stock', async (req, res) => {
  const stock = req.params.stock;
  try {
      // Appel de la fonction pour récupérer le prix de l'action
      const stockPrice = await getStockPrice(stock);
      
      // Envoi du prix de l'action en réponse
      res.json(stockPrice);
  } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération du prix de l\'action :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du prix de l\'action' });
  }
});



// Route ou service utilisant la fonction getCurrencyPrice
app.get('/currency/:currency', async (req, res) => {
  const currency = req.params.currency;
  try {
      // Appel de la fonction pour récupérer le prix de la devise
      const currencyPrice = await getCurrencyPrice(currency);
      
      // Envoi du prix de la devise en réponse
      res.json(currencyPrice);
  } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération du prix de la devise :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du prix de la devise' });
  }
});


// Définition de la fonction pour récupérer le prix de l'action
async function getStockPrice(stock) {
  try {
      // Appel du web service tiers
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${stock}`);
      
      // Récupération du prix de l'action depuis la réponse
      const price = response.data.chart.result[0].meta.regularMarketPrice;
      const currency = response.data.chart.result[0].meta.currency;

      // Retourne le prix de l'action et la devise
      return { price, currency };
  } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération du prix de l\'action :', error);
      throw new Error('Erreur lors de la récupération du prix de l\'action');
  }
}


// Définition de la fonction pour récupérer le prix de la devise
async function getCurrencyPrice(currency) {
  try {
      // Appel du web service tiers
      const currencySplit = currency.split(":")[0];
      const response = await axios.get(`https://query1.finance.yahoo.com/v7/finance/spark?symbols=${currencySplit}%3DX`);
      
      // Récupération du prix de la devise depuis la réponse
      const price = response.data.spark.result[0].response[0].meta.regularMarketPrice;

      // Retourne le prix de la devise
      return { price };
  } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la récupération du prix de la devise :', error);
      throw new Error('Erreur lors de la récupération du prix de la devise');
  }
}


// Démarrage du serveur
// Création du serveur HTTPS
https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
