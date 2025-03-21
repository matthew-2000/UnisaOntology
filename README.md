# 🧠 Unisa Ontology Explorer

**Unisa Ontology Explorer** è un'applicazione web sviluppata come progetto per il corso di **Intelligent Web** presso l’**Università degli Studi di Salerno**.  
L’obiettivo è quello di esplorare e interrogare un’ontologia OWL relativa all’offerta formativa dell’università, tramite interfacce web dinamiche e query SPARQL.

---

## 📚 Descrizione del Progetto

L'app consente agli utenti di:

- Visualizzare i dipartimenti dell'ateneo
- Esplorare i corsi di studio proposti da ciascun dipartimento
- Consultare gli insegnamenti appartenenti a un corso di studio
- Trovare corsi rilevanti in base a **interessi personali** o **opportunità di carriera**
- Interagire in modo dinamico con i dati dell'ontologia tramite un’interfaccia web intuitiva

---

## 🛠️ Tecnologie Utilizzate

- **Node.js** + **Express** – backend server
- **SPARQL** – per interrogare il triplestore
- **Apache Jena Fuseki** – server SPARQL per l’ontologia
- **OWL Ontology (.ttl)** – ontologia RDF in formato Turtle
- **Pug (ex-Jade)** – template engine
- **HTML/CSS/JS** – frontend
- **IntelliJ IDEA** – ambiente di sviluppo

---

## 📁 Struttura del Progetto

```
├── app.js                       # Server Express
├── ontology/
│   └── UnisaOntology.ttl       # Ontologia OWL
├── public/
│   ├── index.html              # Interfaccia utente
│   └── stylesheets/style.css   # Stili
├── views/
│   ├── index.pug               # Template Pug
│   ├── layout.pug
│   └── error.pug
├── .gitignore
├── package.json
└── package-lock.json
```

---

## ▶️ Come Avviare il Progetto

### Requisiti:

- Node.js >= 14
- Apache Jena Fuseki (con dataset `unisa` configurato)
- IntelliJ IDEA (opzionale)

### Setup:

1. **Clona il progetto:**

```bash
git clone https://github.com/tuo-username/unisa-ontology-explorer.git
cd unisa-ontology-explorer
```

2. **Installa le dipendenze:**

```bash
npm install
```

3. **Avvia Fuseki** e carica l’ontologia `UnisaOntology.ttl` nel dataset `unisa`.

4. **Avvia il server:**

```bash
node app.js
```

5. **Accedi da browser:**

```
http://localhost:3000
```

---

## 🔍 Funzionalità Principali

- **/dipartimenti** – elenca tutti i dipartimenti
- **/corsi-di-studio?dipartimento=...** – corsi offerti da un dipartimento
- **/insegnamenti?corsoDiStudio=...** – lista degli insegnamenti
- **/opportunita-di-carriera** – opportunità collegate ai corsi
- **/interessi** – interessi accademici
- **/corsi-legati-interessi** – corsi rilevanti rispetto a uno o più interessi
- **/corsi-legati-opportunita** – corsi che offrono specifiche opportunità di carriera

---

## 🧠 Ontologia

L’ontologia è espressa in **OWL**, in formato **Turtle (.ttl)**, e include concetti quali:

- Dipartimenti
- Corsi di Laurea (Triennali e Magistrali)
- Insegnamenti
- Interessi accademici
- Opportunità di carriera

Relazioni semantiche e proprietà sono modellate per facilitare l’interrogazione tramite SPARQL.

---

## 👨‍🎓 Progetto Universitario

- **Corso:** Intelligent Web
- **Università:** Università degli Studi di Salerno
- **Anno Accademico:** 2023/2024

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**.  
Sentiti libero di riutilizzarlo e modificarlo per fini educativi o accademici.

---
