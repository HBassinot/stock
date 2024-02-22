import logo from './logo.svg';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';

function App() {
  let domain = "stock.hbassinot.com";
  let port = 443;

  if(false) {
    domain = "localhost";
  }
  const [portefeuille, setPortefeuille] = useState(0);

  const fetchData = async () => {
    try {

      
      // callStock() V1
      callPortfolios(); // V2


    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 15000); // Rafraîchir toutes les 15 secondes
    return () => clearInterval(interval);
  }, []);

  /*** V2 */

  const callPortfolios = async () => {
    let valeurTotale = 0;

    getPrixPortfoliosHBassinot().then(portfolios => {
      for (let i = 0; i < portfolios.length; i++) {
        const keys = Object.keys(portfolios[i]);
        valeurTotale += portfolios[i][keys[0]];
       
      }

      const montantElement = document.getElementById('montant');
    
      // Ajouter la classe d'effet de clignotement
      montantElement.classList.add('blink');
  
      setPortefeuille(valeurTotale);
      
    
      // Supprimer la classe d'effet de clignotement après 500ms
      setTimeout(() => {
        montantElement.classList.remove('blink');
      }, 1500);


    });
  }

  const getPrixPortfoliosHBassinot = async () => {
    const response = await axios.get(`https://`+domain+`:`+port+`/portfolio/values`);
    return response.data; 
  };

  /********/

  /*** V1 */

  const callStock = async () => {
    // Charger les données de configuration depuis le fichier config.json
    const configResponse = await axios.get('/config.json');
    const config = configResponse.data;
  
    // Vérifier que config.actions est bien un tableau
    if (!Array.isArray(config.portfolios)) {
      throw new Error("Les données de configuration ne sont pas valides");
    }
    
    // Calculer la valeur totale du portefeuille en se basant sur les données de la bourse
    let valeurTotale = 0;
    for (const portfolio of config.portfolios) {
      for (const action of portfolio.actions) {
        
        //valeurTotale += getPrixStock(action.nom, prixAction) * action.quantite;
        getPrixActionsHBassinot(action.nom).then(price => {
          valeurTotale += price * action.quantite;
          setPortefeuille(valeurTotale);
        })
      }
    }
  }

  const getPrixActionsHBassinot = async (stock) => {
    const response = await axios.get(`https://`+domain+`:`+port+`/stock/price/${stock}`);
    let cur = 1;
    if(response.data.currency === "USD") {
      const usdcar = await axios.get(`https://`+domain+`:`+port+`/currency/USDCAD`);
      cur = usdcar.data.price;
    }
    return response.data.price * cur; 
  };

  /*******/

  return (
    <div className="App">
      <h1>Portefeuille en temps réel</h1>
      <div className='container'><div className='montant' id='montant'>{portefeuille.toFixed(2)} $</div></div>
    </div>
  );
}





export default App;
