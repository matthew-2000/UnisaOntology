const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const FUSEKI_URL = 'http://localhost:3030/unisa/query';


// Servi i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Serve il file HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Funzione per eseguire una query SPARQL
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

app.get('/corsi-di-studio', async (req, res) => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?nome ?codice ?descrizione ?durata ?CFU ?sitoWeb
    WHERE {
      ?corso rdf:type/rdfs:subClassOf* :CorsoDiStudio ;
             :nome ?nome ;
             :codice ?codice ;
             :descrizione ?descrizione ;
             :durata ?durata ;
             :CFU ?CFU ;
             :sitoWeb ?sitoWeb .
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/corsi-laurea-magistrale', async (req, res) => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?corso ?nome ?codice ?descrizione ?durata ?CFU ?sitoWeb
    WHERE {
      ?corso rdf:type :CorsoDiLaureaMagistrale ;
             :nome ?nome ;
             :codice ?codice ;
             :descrizione ?descrizione ;
             :durata ?durata ;
             :CFU ?CFU ;
             :sitoWeb ?sitoWeb .
    }
  `;

  app.get('/corsi-laurea-triennale', async (req, res) => {
    const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?corso ?nome ?codice ?descrizione ?durata ?CFU ?sitoWeb
    WHERE {
      ?corso rdf:type :CorsoDiLaureaTriennale ;
             :nome ?nome ;
             :codice ?codice ;
             :descrizione ?descrizione ;
             :durata ?durata ;
             :CFU ?CFU ;
             :sitoWeb ?sitoWeb .
    }
  `;

    try {
      const data = await executeSparqlQuery(query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Route per ottenere gli insegnamenti di un corso di studio
app.get('/insegnamenti-corso', async (req, res) => {
  const corsoDiStudio = req.query.corso; // Nome del corso di studio passato come parametro di query
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?insegnamento
    WHERE {
      ?corso :nome "${corsoDiStudio}" ;
             :comprende ?insegnamento .
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/professori-corso', async (req, res) => {
  const corsoDiStudio = req.query.corso; // Nome del corso di studio passato come parametro di query
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?professore
    WHERE {
      ?corsoDiStudio :nome "${corsoDiStudio}" ;
                     :comprende ?insegnamento .
      ?insegnamento :insegna ?professore .
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route per ottenere i dettagli di un insegnamento specifico
app.get('/dettagli-insegnamento', async (req, res) => {
  const insegnamento = req.query.insegnamento; // Nome dell'insegnamento passato come parametro di query
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?nome ?codice ?descrizione ?CFU ?annoDiCorso
    WHERE {
      ?insegnamento :nome "${insegnamento}" ;
                     :codice ?codice ;
                     :descrizione ?descrizione ;
                     :CFU ?CFU ;
                     :annoDiCorso ?annoDiCorso .
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/dettagli-professore', async (req, res) => {
  const nomeProfessore = req.query.nome;
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT ?nome ?cognome ?insegnamento
    WHERE {
      ?professore rdf:type :Professore ;
                  :nome "${nomeProfessore}" ;
                  :cognome ?cognome ;
                  :insegna ?insegnamento .
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

    SELECT ?nome
    WHERE {
      ?interest rdf:type :Interesse ;
                :nomeInteresse ?nome .
    }
  `;
  try {
    const data = await executeSparqlQuery(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/corsi-per-interesse', async (req, res) => {
  let interessi = req.query.interessi;

  // Assicurati che gli interessi siano una stringa e suddividili in un array
  if (typeof interessi === 'string') {
    interessi = interessi.split('_'); // Suddividi la stringa per il carattere di underscore
  }

  if (!interessi || !Array.isArray(interessi) || interessi.length === 0) {
    return res.status(400).json({ error: "Interessi non forniti o non validi" });
  }

  // Creazione dinamica della parte VALUES della query
  const valoriInteressi = interessi.map(interesse => `"${interesse}"`).join(' ');

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://www.semanticweb.org/ontology#>
    
    SELECT DISTINCT ?nomeInteresse ?nomeCorso ?descrizioneCorso ?sitoWeb
    WHERE {
      ?interesse rdf:type :Interesse ;
                 :nomeInteresse ?nomeInteresse .
      
      VALUES ?nomeInteresse { ${valoriInteressi} }
      
      ?interesse :legatoA ?corsoDiStudio .
      
      ?corsoDiStudio rdf:type ?tipoCorso ;
                     :nome ?nomeCorso ;
                     :descrizione ?descrizioneCorso ;
                     :sitoWeb ?sitoWeb .
      
      FILTER ( ?tipoCorso IN (:CorsoDiLaureaTriennale, :CorsoDiLaureaMagistrale) )
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
