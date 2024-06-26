const express = require('express');
const fetch = import('node-fetch');

const app = express();
const PORT = 3000;
const FUSEKI_URL = 'http://localhost:3030/unisa/query'; // Cambia 'dataset' con il nome del tuo dataset

app.get('/sparql', async (req, res) => {
    const query = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT ?subject ?predicate ?object
        WHERE {
            ?subject ?predicate ?object
        }
        LIMIT 10
    `;

    try {
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

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
