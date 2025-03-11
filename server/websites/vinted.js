const axios = require('axios');

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convertir en millisecondes
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Scrape data from Vinted
 * @param {String} url - URL of the Vinted API or page to scrape
 * @param {String} userAgent - User-Agent header for requests
 * @param {String} cookie - Cookie header for requests
 * @returns {Array} Extracted sales data
 */
async function scrape(url, userAgent, cookie) {
  const headers = {
    'User-Agent': userAgent,
    'Cookie': cookie,
  };

  try {
    const response = await axios.get(url, { headers });
    const items = response.data.items || [];
    

    const sales = items.map(item => {
      // Extraction de l'ID LEGO (4-5 chiffres) depuis le titre
      const legoIdMatch = item.title.match(/\b\d{4,5}\b/);
      const legoId = legoIdMatch ? legoIdMatch[0] : null;

      return {
        //id: item.id,
        title: item.title,
        lego_id: legoId, // Ajout de l'ID LEGO
        brand_title: item.brand_title,
        price: item.price,
        total_item_price: item.total_item_price,
        published_time : formatTimestamp(item.photo?.high_resolution?.timestamp || Date.now()),
        url: `https://www.vinted.fr/items/${item.id}`,
        status: item.status,
        user_name: item.user?.login,

      };
    });

    return sales;
  } catch (error) {
    console.error('Error fetching data from Vinted:', error);
    return null;
  }
}

module.exports = { scrape };
