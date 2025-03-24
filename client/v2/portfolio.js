// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors (CSS)
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const selectPrice = document.querySelector('#sort-select');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */


const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-ten.vercel.app/deals/search?limit=${size}`
    );
    
    const body = await response.json();

    return {
      result: body.results, // ← ton backend renvoie .results
      meta: { count: body.total, currentPage: 1, pageCount: 1 }
    };
  } catch (error) {
    console.error(error);
    return { result: [], meta: {} };
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id="${deal.legoId}">
        <span>${deal.legoId}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
        <button class="favorite-btn" data-id="${deal.legoId}">Add to Favorites</button>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Select the page to display
 */
selectPage.addEventListener('change', async (event) => {
  const goToPage = parseInt(event.target.value); // calculé dans l'api
  console.log(goToPage);
  const deals = await fetchDeals(goToPage, parseInt(selectShow.value));// selectShow : ce qu'on a cliqué
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);

});

/**
 * Sort deals by discount
 */
const sortByBestDiscount = () => {
  currentDeals.sort((a, b) => b.discount - a.discount); 
  render(currentDeals, currentPagination);
};
document.querySelector('#best-discount').addEventListener('click', sortByBestDiscount);

/**
 * Sort deals by most commented
 */
const sortByMostCommented = () => {
  currentDeals.sort((a, b) => b.comments - a.comments); 
  render(currentDeals, currentPagination);
};
document.querySelector('#most-commented').addEventListener('click', sortByMostCommented);

/**
 * Sort deals by hot deals
 */
const sortByHotDeals = () => {
  currentDeals.sort((a, b) => b.temperature - a.temperature); 
  render(currentDeals, currentPagination);
};
document.querySelector('#hot-deals').addEventListener('click', sortByHotDeals);


/**
 * Sort deals by selected criteria (price or date)
 */
const sortDeals = () => {
  const sortValue = selectPrice.value; // Récupère la valeur sélectionnée
  if (sortValue === 'price-asc') {
    currentDeals.sort((a, b) => a.price - b.price); // Tri par prix croissant
  } else if (sortValue === 'price-desc') {
    currentDeals.sort((a, b) => b.price - a.price); // Tri par prix décroissant
  } else if (sortValue === 'date-asc') {
    currentDeals.sort((a, b) => new Date(a.published) - new Date(b.published)); // Tri par date croissante
  } else if (sortValue === 'date-desc') {
    currentDeals.sort((a, b) => new Date(b.published) - new Date(a.published)); // Tri par date décroissante
  }
  render(currentDeals, currentPagination); // Rafraîchit l'affichage
};

// Ajout de l'écouteur d'événements
selectPrice.addEventListener('change', sortDeals);



/**
 * Display Vinted sales
 */
const renderSales = (sales) => {
  console.log('renderSales() function called with:', sales);

  // Récupérer la section des ventes, créer une nouvelle section si elle n'existe pas
  let salesContainer = document.querySelector('#vinted-sales-section');

  // Si la section n'existe pas encore, on la crée
  if (!salesContainer) {
    salesContainer = document.createElement('section');
    salesContainer.id = 'vinted-sales-section'; // ID de la nouvelle section pour les ventes
    document.body.appendChild(salesContainer);
  }

  // Ajouter un titre pour les ventes
  salesContainer.innerHTML = '<h2>Vinted Sales</h2>';

  // Vérifier si on a bien des ventes à afficher
  if (!sales || sales.length === 0) {
    console.warn('No sales available');
    document.querySelector('#nbSales').textContent = '0'; // Afficher 0 ventes
    salesContainer.innerHTML += '<p>No sales available</p>';
    return;
  }

  // Trier les ventes par date (de la plus ancienne à la plus récente)
  sales.sort((a, b) => new Date(a.published) - new Date(b.published));

  // Mettre à jour le nombre total de ventes dans l'élément #nbSales
  document.querySelector('#nbSales').textContent = sales.length;

  // Générer le HTML des ventes
  const salesHTML = sales.map(sale => `
    <div class="sale">
      <span><strong>${sale.title}</strong></span>
      <span>Price: <strong>€${sale.price}</strong></span>
      <span>Date: ${new Date(sale.published).toLocaleDateString()}</span>
      <a href="${sale.link}" target="_blank">View Sale</a>
    </div>
  `).join('');

  // Ajouter les ventes sous le titre "Vinted Sales"
  salesContainer.innerHTML += salesHTML;

  // Calculer les valeurs des indicateurs de prix
  updatePriceIndicators(sales);
};

/**
 * Update price indicators (average, p5, p25, p50, lifetime)
 */
const updatePriceIndicators = (sales) => {
  const prices = sales.map(sale => sale.price).sort((a, b) => a - b);
  
  // Calcul de l'indicateur moyen (average)
  const averagePrice = calculateAverage(prices);
  
  // Calcul des percentiles (p5, p25, p50)
  const p5Price = calculatePercentile(prices, 5);
  const p25Price = calculatePercentile(prices, 25);
  const p50Price = calculatePercentile(prices, 50);

  // Calcul de la "Lifetime value" en jours
  const lifetimeValue = calculateLifetime(sales);

  // Mettre à jour l'HTML avec les valeurs calculées
  document.querySelector('#nbSales').textContent = sales.length; // nbSales
  document.querySelector('#p5Price').textContent = p5Price; // p5
  document.querySelector('#p25Price').textContent = p25Price; // p25
  document.querySelector('#p50Price').textContent = p50Price; // p50
  document.querySelector('#lifetimeValue').textContent = `${lifetimeValue} days`; // Lifetime value
};

/**
 * Calculate the average price
 */
const calculateAverage = (prices) => {
  const sum = prices.reduce((acc, price) => acc + price, 0);
  return (sum / prices.length).toFixed(2);
};

/**
 * Calculate the percentile value from a sorted array
 */
const calculatePercentile = (arr, percentile) => {
  const index = Math.floor((percentile / 100) * arr.length);
  return arr[index];
};

/**
 * Calculate the lifetime value (the number of days the set has been listed)
 */
const calculateLifetime = (sales) => {
  if (sales.length === 0) return 0;
  
  const firstSaleDate = new Date(sales[0].published);
  const latestSaleDate = new Date(sales[sales.length - 1].published);
  
  const difference = latestSaleDate - firstSaleDate; // Difference en millisecondes
  const lifetime = Math.floor(difference / (1000 * 60 * 60 * 24)); // Convertir en jours
  
  return lifetime;
};

/**
 * Fetch sales for the selected Lego set
 */
const fetchSales = async (legoSetId) => {
  try {
    const url = `https://lego-ten.vercel.app/sales/search?legoSetId=${legoSetId}`;

    const response = await fetch(url);
    const body = await response.json();

    return body.results.map(sale => ({
      title: sale.title,
      price: parseFloat(sale.price?.amount || 0),
      published: new Date(sale.published_time), // Date JS utilisable
      link: sale.url
    }));
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
};

/**
 * Fetch and display sales for the selected Lego set when the page loads or when a new set is selected
 */
document.addEventListener('DOMContentLoaded', () => {
  const selectLegoSetIds = document.querySelector('#lego-set-id-select');

  // Lors de la sélection d'un set LEGO, récupérer les ventes correspondantes
  selectLegoSetIds.addEventListener('change', async () => {
    const selectedId = selectLegoSetIds.value; // Récupérer l'ID du set LEGO sélectionné
    if (selectedId) {
      const sales = await fetchSales(selectedId);
      renderSales(sales);
    }
  });

  // Initialiser avec l'ID du set sélectionné au chargement de la page
  const initialId = selectLegoSetIds.value;
  if (initialId) {
    fetchSales(initialId).then(sales => renderSales(sales));
  }
});


/**
 * Favourites
 */
// Gestion du clic sur le bouton "Ajouter aux favoris"
document.addEventListener('click', (event) => {
  if (event.target && event.target.classList.contains('favorite-btn')) {
    const dealId = event.target.getAttribute('data-id');
    toggleFavorite(dealId); // Ajouter ou retirer des favoris
  }
});

// Liste des favoris (cela pourrait être un tableau dans le localStorage ou une variable globale)
let favorites = [];

// Fonction pour ajouter ou retirer des favoris
const toggleFavorite = (dealId) => {
  const index = favorites.indexOf(dealId);
  
  if (index === -1) {
    favorites.push(dealId); // Ajouter aux favoris
  } else {
    favorites.splice(index, 1); // Retirer des favoris
  }
  
  console.log('Favorites:', favorites); // Afficher la liste des favoris
};

document.querySelector('#filter-favorites').addEventListener('click', () => {
  const favoriteDeals = currentDeals.filter(deal => favorites.includes(deal.uuid));
  render(favoriteDeals, currentPagination); // Afficher uniquement les favoris
});




document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});
