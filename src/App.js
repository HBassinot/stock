import logo from './logo.svg';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';

function App() {
  const [portefeuille, setPortefeuille] = useState(0);

  const fetchData = async () => {
    try {
      // Charger les données de configuration depuis le fichier config.json
      const configResponse = await axios.get('/config.json');
      const config = configResponse.data;

      // Vérifier que config.actions est bien un tableau
      if (!Array.isArray(config.actions)) {
        throw new Error("Les données de configuration ne sont pas valides");
      }
     
      // Calculer la valeur totale du portefeuille en se basant sur les données de la bourse
      let valeurTotale = 0;
      for (const action of config.actions) {
        
        //valeurTotale += getPrixStock(action.nom, prixAction) * action.quantite;
        getPrixActionsYahooFinance(action.nom).then(price => {
          valeurTotale += price * action.quantite;
          setPortefeuille(valeurTotale);
        })
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000); // Rafraîchir toutes les 100 secondes
    return () => clearInterval(interval);
  }, []);

  const getPrixStock = (stock, prixAction) => {
    for (const action of prixAction) {
      if(action.symbol === stock) {
        return action.price;
      }
    }
    return 0;
  }

  const getPrixActionsYahooFinance = async (stock) => {
    const response = await axios.get(`https://stock.hbassinot.com:8000/stock/price/${stock}`);
    let cur = 1;
    if(response.data.currency === "USD") {
      const usdcar = await axios.get(`https://stock.hbassinot.com:8000/currency/USDCAD`);
      cur = usdcar.data.price;
    }
    return response.data.price * cur; 
  };

  return (
    <div className="App">
      <h1>Portefeuille en temps réel</h1>
      <div className='container'><div className='montant'>{portefeuille.toFixed(2)} $</div></div>
    </div>
  );
}

export default App;
