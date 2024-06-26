const express = require('express');
const app = express();
const PORT = 3000;
const FUSEKI_URL = 'http://localhost:3030/unisa/query';

// Funzione per eseguire una query SPARQL
async function executeSparqlQuery(query) {
  // Importa node-fetch
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(FUSEKI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/sparql-results+json'
    },
    body: query
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  return await response.json();
}

// Endpoint per ottenere tutti i corsi di laurea triennale
app.get('/corsi-laurea-triennale', async (req, res) => {
  const query = `
        PREFIX unisa: <http://www.unisa.it/ontologie/corsi-di-studio.owl#>
        SELECT ?corsoDiLaureaTriennale
        WHERE {
            ?corsoDiLaureaTriennale a unisa:CorsoDiLaureaTriennale .
        }
    `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per ottenere i docenti e i corsi che tengono
app.get('/docenti-insegnamenti', async (req, res) => {
  const query = `
        PREFIX unisa: <http://www.unisa.it/ontologie/corsi-di-studio.owl#>
        SELECT ?docente ?insegnamento
        WHERE {
            ?insegnamento unisa:tenutoDa ?docente .
        }
    `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per ottenere gli studenti e i corsi a cui sono iscritti
app.get('/studenti-corsi', async (req, res) => {
  const query = `
        PREFIX unisa: <http://www.unisa.it/ontologie/corsi-di-studio.owl#>
        SELECT ?studente ?corso
        WHERE {
            ?studente unisa:iscrittoA ?corso .
        }
    `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per ottenere i dettagli dei corsi di studio
app.get('/dettagli-corsi', async (req, res) => {
  const query = `
        PREFIX unisa: <http://www.unisa.it/ontologie/corsi-di-studio.owl#>
        SELECT ?corso ?nome ?descrizione ?cfu
        WHERE {
            ?corso a unisa:CorsoDiStudio .
            ?corso unisa:nome ?nome .
            ?corso unisa:descrizione ?descrizione .
            ?corso unisa:CFU ?cfu .
        }
    `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint per ottenere tutte le opportunità di carriera offerte
app.get('/opportunita-carriera', async (req, res) => {
  const query = `
        PREFIX unisa: <http://www.unisa.it/ontologie/corsi-di-studio.owl#>
        SELECT ?opportunita
        WHERE {
            ?opportunita a unisa:OpportunitaDiCarriera .
        }
    `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
