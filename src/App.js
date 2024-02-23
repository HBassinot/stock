import logo from './logo.svg';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';

function App() {
  let domain = "stock.hbassinot.com";
  let port = 8000;

  if(false) {
    domain = "localhost";
  }
  const [portefeuille, setPortefeuille] = useState(0);

  const [celi, setCeli] = useState(0);
  const [reer, setReer] = useState(0);
  const [ne, setNe] = useState(0);

  const [celiVar, setCeliVar] = useState("green");
  const [reerVar, setReerVar] = useState("green");
  const [neVar, setNeVar] = useState("green");

  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

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


    // Ajouter la classe d'effet de clignotement
    const montantElement = document.getElementById('montant');
    montantElement.classList.add('blink');

    getPrixPortfoliosHBassinot().then(portfolios => {
      for (let i = 0; i < portfolios.length; i++) {
        const keys = Object.keys(portfolios[i]);
        valeurTotale += portfolios[i][keys[0]];
      }

      let reerValue = portfolios[0]['REER'];
      let celiValue = portfolios[1]['CELI'];
      let neValue = portfolios[2]['NE'];


      setReerVar("green");
      if(reer > reerValue) {
        setReerVar("red");
      } 
      setCeliVar("green");
      if(celi > celiValue) {
        setCeliVar("red");
      } 
      setNeVar("green");
      if(ne > neValue) {
        setNeVar("red");
      } 

      setReer(reerValue);
      setCeli(celiValue);
      setNe(neValue);

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

  function formatPrice(price) {
    // Utiliser la méthode toLocaleString() pour formater le montant
    // en séparant les milliers et gérant les décimales
    return price.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
  }

  return (
    <div className="App">
      <h1 onClick={toggleVisibility}>Portefeuille en temps réel</h1>
      <div className='container'><div className='montant' id='montant'>{formatPrice(portefeuille)}</div></div>

      <div className='accounts'>

        {isVisible && (<table>
          <tbody>
            <tr>
              <td>REER</td>
              <td>CELI</td>
              <td>NE</td>
            </tr>
            <tr>
              <td>{formatPrice(reer)} <div className={"triangle-"+reerVar}></div></td>
              <td>{formatPrice(celi)} <div className={"triangle-"+celiVar}></div></td>
              <td>{formatPrice(ne)} <div className={"triangle-"+neVar}></div></td>
            </tr>
          </tbody>
        </table>
        )}

      </div>
    </div>
  );
}

export default App;
