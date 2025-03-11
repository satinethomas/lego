const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://satinetms:IloveWebDesign8@cluster0.108zm.mongodb.net/lego?retryWrites=true&writeConcern=majority';
const DB_NAME = 'lego';
const COLLECTION_DEALS = 'deals';
const COLLECTION_SALES = 'sales';

/**
 * Connexion à MongoDB
 */
async function connectToDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME);
}

/**
 * Trouve les meilleures réductions disponibles
 */
async function findBestDiscountDeals() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find({ discount: { $ne: null } }).sort({ discount: -1 }).toArray();
}

/**
 * Trouve les deals les plus commentés
 */
async function findMostCommentedDeals() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find().sort({ nb_comments: -1 }).toArray();
}

/**
 * Trie les deals par prix (croissant)
 */
async function findDealsSortedByPrice() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find().sort({ price: 1 }).toArray();
}

/**
 * Trie les deals par date d'ajout (du plus récent au plus ancien)
 */
async function findDealsSortedByDate() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find().sort({ _id: -1 }).toArray();
}

/**
 * Trouve toutes les ventes pour un ID LEGO donné
 */
async function findSalesByLegoSetId(legoSetId) {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_SALES);
  
  return await collection.find({ lego_id: legoSetId }).toArray();
}


/**
 * Trouve toutes les ventes ajoutées il y a moins de 3 semaines
 */
async function findRecentSales() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_SALES);

  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  return await collection.find({
    $expr: {
      $gte: [
        { $dateFromString: { dateString: "$published_time", format: "%d/%m/%Y %H:%M:%S" } },
        threeWeeksAgo
      ]
    }
  }).toArray();
}
/**
 * Exécute les requêtes et affiche les résultats
 */
async function runQueries() {
  //console.log('Best Discount Deals:', await findBestDiscountDeals());
  //console.log('Most Commented Deals:', await findMostCommentedDeals());
  //console.log('Deals Sorted by Price:', await findDealsSortedByPrice());
  //console.log('Deals Sorted by Date:', await findDealsSortedByDate());
  console.log('Sales for LEGO ID 75403:', await findSalesByLegoSetId('75403'));
  //console.log('Recent Sales:', await findRecentSales());
}

// Exécuter les requêtes
runQueries();