// ATTENTION IMPORTANT : IL FAUT BIEN METTRE EN COMMENTAIRES LES DIFFERENTES FONCTIONS SINON CA PREND EN COMPTE UNIQUEMENT LA PREMIERE

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 8092;

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://satinetms:IloveWebDesign8@cluster0.108zm.mongodb.net/lego?retryWrites=true&writeConcern=majority';
const DB_NAME = 'lego';
let db; // On va y stocker l’accès à la base

// Middlewares
app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());
app.options('*', cors());

//  Connexion à MongoDB
MongoClient.connect(MONGODB_URI)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('Connexion à MongoDB réussie');
  })
  .catch(err => {
    console.error('Erreur de connexion MongoDB :', err);
  });

// Route racine de test
app.get('/', (req, res) => {
  res.send({ ack: true });
});

// Route pour récupérer un deal spécifique par ID
/*app.get('/deals/:id', async (req, res) => {
  const dealId = req.params.id;

  try {
    const deal = await db.collection('deals').findOne({ legoId: dealId });

    if (!deal) {
      return res.status(404).json({ error: 'Deal non trouvé' });
    }

    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});*/

// Récupérer deals spécifiques avec des conditions (limit, price, date, filterby...)
/*app.get('/deals/search', async (req, res) => {
  const { limit = 12, price, date, filterBy } = req.query;
  const query = {};

  // Filtrer par prix maximum
  if (price) {
    query.price = { $lte: parseFloat(price) };
  }

  // Filtrer par jour précis (ex: 18/03/2025)
  if (date) {
    try {
      const userDate = new Date(date);
      const day = userDate.getDate().toString().padStart(2, '0');
      const month = (userDate.getMonth() + 1).toString().padStart(2, '0');
      const year = userDate.getFullYear();

      const regexDate = `${day}/${month}/${year}`;
      query.post_date = { $regex: `^${regexDate}` };
    } catch (err) {
      console.warn('Date invalide');
    }
  }

  // Tri selon filtre
  let sort = { price: 1 };
  if (filterBy === 'best-discount') {
    sort = { discount: -1 };
  } else if (filterBy === 'most-commented') {
    sort = { nb_comments: -1 };
  }

  try {
    const results = await db.collection('deals')
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      limit: parseInt(limit),
      total: results.length,
      results
    });
  } catch (err) {
    console.error('Erreur deals/search :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});/*

/*Exemple de commandes dans INSOMNIA
GET http://localhost:8092/deals/search?filterBy=most-commented&limit=5
GET http://localhost:8092/deals/search?filterBy=best-discount
GET http://localhost:8092/deals/search?price=30&date=2025-03-18
GET http://localhost:8092/deals/search?price=25
*/


app.get('/sales/search', async (req, res) => {
  const { limit = 12, legoSetId } = req.query; //limite 12 d'office mais on peut modifier quand on search
  const query = {}; // remplissage selon filtres demandés

  if (legoSetId) {
    query.lego_id = legoSetId; //recherche dans valeur lego_id de MongoDB
  }

  try {
    const results = await db.collection('sales')
      .find(query)
      .sort({ published_time: -1 }) // Tri décroissant par date
      .limit(parseInt(limit)) // limite nb résultats
      .toArray();

    res.json({ //envoi de la réponse json
      limit: parseInt(limit), //la limite
      total: results.length, //cb on en a trouvé
      results //liste des sales
    });
  } catch (err) {
    console.error('Erreur dans /sales/search :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`📡 Serveur Express lancé sur http://localhost:${PORT}`);
});

module.exports = app;
