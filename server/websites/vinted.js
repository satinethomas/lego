const axios = require('axios');

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

    const sales = items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      discount: item.discount || 0,
      url: `https://www.vinted.fr/items/${item.id}`,
      photo: item.photos?.[0]?.url || null,
      total_item_price: item.total_item_price,
      status: item.status,
      user: {
        id: item.user?.id,
        login: item.user?.login,
        profile_url: item.user?.profile_url,
        photo: item.user?.photo?.url || null,
      },
    }));

    return sales;
  } catch (error) {
    console.error('Error fetching data from Vinted:', error);
    return null;
  }
}

module.exports = { scrape };
