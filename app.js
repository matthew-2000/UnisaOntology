const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const FUSEKI_URL = 'http://localhost:3030/unisa/query';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

async function executeSparqlQuery(query) {
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

// Funzione helper per creare filtri SPARQL da array
function createSparqlFilter(param, values) {
  if (!Array.isArray(values)) {
    values = [values];
  }
  return values.map(value => `?${param} = "${value}"`).join(" || ");
}

app.get('/dipartimenti', async (req, res) => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>    
    SELECT ?nome ?edificio WHERE {
      ?dip rdf:type :Dipartimento;
           :nome ?nome;
           :edificio ?edificio.
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/corsi-di-studio', async (req, res) => {
  const dipartimento = req.query.dipartimento; // Passa il nome del dipartimento come query param
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>    
    SELECT ?nomeCorso ?descrizione ?durata ?cfu
    WHERE {
      ?dipartimento rdf:type :Dipartimento;
                    :nome "${dipartimento}";  # Sostituisci con il nome del dipartimento specifico
                    :propone ?corso.
      ?corso :nome ?nomeCorso;
              :descrizione ?descrizione;
              :durata ?durata;
              <http://www.co-ode.org/ontologies/ont.owl#CFUCorsoDiStudio> ?cfu.
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/insegnamenti', async (req, res) => {
  const corsoDiStudio = req.query.corsoDiStudio; // Passa il nome del corso di studio come query param

  if (!corsoDiStudio) {
    return res.status(400).json({ error: "Nome del corso di studio non specificato" });
  }

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?nomeInsegnamento ?CFU ?annoDiCorso ?codice ?descrizione
    WHERE {
      ?corso rdf:type/rdfs:subClassOf* :CorsoDiStudio ;
             :nome "${corsoDiStudio}" ;
             :comprendeInsegnamento ?insegnamento .
      ?insegnamento :nome ?nomeInsegnamento .
      OPTIONAL { ?insegnamento :CFU ?CFU }
      OPTIONAL { ?insegnamento :annoDiCorso ?annoDiCorso }
      OPTIONAL { ?insegnamento :descrizione ?descrizione }
    }
    ORDER BY ?annoDiCorso
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/opportunita-di-carriera', async (req, res) => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>    
    SELECT ?nome ?descrizione ?settore WHERE {
      ?opp rdf:type :OpportunitàDiCarriera;
           :nome ?nome;
           :descrizione ?descrizione;
           :settore ?settore.
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/corsi-legati-opportunita', async (req, res) => {
  let opportunita = req.query.opportunita; // Può essere un array o una stringa singola

  // Assicurati che opportunita sia un array
  if (typeof opportunita === 'string') {
    opportunita = opportunita.split(','); // Suddividi la stringa per la virgola
  }

  if (!opportunita || !Array.isArray(opportunita) || opportunita.length === 0) {
    return res.status(400).json({ error: "Opportunità non fornite o non valide" });
  }

  // Creazione dinamica della parte VALUES della query
  const valoriOpportunita = opportunita.map(op => `"${op.trim()}"`).join(' ');

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT DISTINCT ?nomeCorso ?descrizione ?durata ?cfu
    WHERE {
      ?corso rdf:type/rdfs:subClassOf* :CorsoDiStudio ;
             :nome ?nomeCorso;
             :descrizione ?descrizione;
             :durata ?durata;
             <http://www.co-ode.org/ontologies/ont.owl#CFUCorsoDiStudio> ?cfu.
             
      ?corso :offreOpportunità ?opportunita.
      ?opportunita :nome ?nomeOpportunita.

      VALUES ?nomeOpportunita { ${valoriOpportunita} }
    }
  `;

  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/interessi', async (req, res) => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>    
    SELECT ?nome WHERE {
      ?interesse rdf:type :Interesse;
                 :nome ?nome.
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/corsi-legati-interessi', async (req, res) => {
  let interessi = req.query.interesse; // Può essere un array o una stringa singola
  if (typeof interessi === 'string') {
    interessi = interessi.split(','); // Suddividi la stringa per la virgola
  }
  if (!interessi || !Array.isArray(interessi) || interessi.length === 0) {
    return res.status(400).json({ error: "Interessi non forniti o non validi" });
  }
  const valoriInteressi = interessi.map(interesse => `"${interesse.trim()}"`).join(' ');
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    PREFIX co: <http://www.co-ode.org/ontologies/ont.owl#>
    
    SELECT DISTINCT ?nomeCorso ?nomeInsegnamento ?cfuInsegnamento
    WHERE {
      ?interesse rdf:type :Interesse ;
                 :nome ?nomeInteresse .
      
      VALUES ?nomeInteresse { ${valoriInteressi} }
      
      ?interesse :legatoA ?insegnamento .
      ?corso :comprendeInsegnamento ?insegnamento ;
             :nome ?nomeCorso ;
             :descrizione ?descrizione ;
             :durata ?durata ;
             co:CFUCorsoDiStudio ?cfu .
      
      ?insegnamento :nome ?nomeInsegnamento ;
                    :CFU ?cfuInsegnamento .
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
