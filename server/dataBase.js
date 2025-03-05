const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const MONGODB_URI = 'mongodb+srv://satinetms:IloveWebDesign8@cluster0.108zm.mongodb.net/lego?retryWrites=true&writeConcern=majority';
const DB_NAME = 'lego';  // Le nom de ta base de données
const COLLECTION_NAME = 'deals';  // Le nom de ta collection dans la base de données

/**
 * Parse webpage data response
 * @param {String} data - HTML response
 * @return {Array} deals
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('.js-vue2[data-vue2]').map((i, element) => {
    const jsonData = $(element).attr('data-vue2');
    if (!jsonData) return null;

    try {
      const parsedData = JSON.parse(jsonData);
      if (!parsedData.props || !parsedData.props.thread) return null;

      const thread = parsedData.props.thread;
      const price = thread.price;
      const originalPrice = thread.nextBestPrice;

      // Vérifier que le prix actuel est défini et différent de 0
      if (!price || price === 0) return null;

      // Vérifier que le prix original est bien défini et supérieur au prix actuel
      let discount = null;
      if (originalPrice && originalPrice > price) {
        discount = Number((((originalPrice - price) * 100) / originalPrice).toFixed(0));
      }

      // Construction manuelle de l'URL de l'image
      let imageUrl = null;
      if (thread.mainImage) {
        const { path, name, ext } = thread.mainImage;
        imageUrl = `https://static.dealabs.com/${path}/${name}.${ext}`;
      }

      return {
        title: thread.title,
        price: price, 
        originalPrice: originalPrice, 
        discount: discount,
        temperature: thread.temperature,
        nb_comments: thread.commentCount,
        link: thread.link,
        image: imageUrl
      };
    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
      return null;
    }
  }).get().filter(deal => deal !== null); // Filtrer les null pour éviter les entrées invalides
};

/**
 * Scrape a given URL
 * @param {String} url - URL to parse
 * @returns {Array|null} Deals
 */
const scrape = async url => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
    }
  });

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error("Erreur de requête :", response.status);
  return null;
};

// Insérer les données scrappées dans MongoDB
async function insertDealsToDatabase(deals) {
  const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    if (deals && deals.length > 0) {
      const result = await collection.insertMany(deals);
      console.log(`${result.insertedCount} deals insérés dans la base de données.`);
    } else {
      console.log("Aucun deal à insérer.");
    }
  } catch (error) {
    console.error("Erreur d'insertion dans MongoDB :", error);
  } finally {
    await client.close();
  }
}

// URL de la page à scraper (à remplacer par la vraie URL de Dealabs)
const url = 'https://www.dealabs.com/';
scrape(url).then(deals => {
  if (deals) {
    insertDealsToDatabase(deals);
  }
});
