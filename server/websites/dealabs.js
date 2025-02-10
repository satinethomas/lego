const fetch = require('node-fetch');
const cheerio = require('cheerio');

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

      // Vérifie si les données contiennent les informations nécessaires
      if (!parsedData.props || !parsedData.props.thread) return null;

      const thread = parsedData.props.thread;

      return {
        title: thread.title, // Nom du produit
        price: thread.price, // Prix
        discount: thread.percentage, // Réduction en %
        link: thread.link, // Lien vers l'offre
        image: thread.mainImage ? `https://static.dealabs.com/${thread.mainImage.uid}` : null
      };
    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
      return null;
    }
  }).get();
};

/**
 * Scrape a given URL
 * @param {String} url - URL to parse
 * @returns {Array|null} Deals
 */
module.exports.scrape = async url => {
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
