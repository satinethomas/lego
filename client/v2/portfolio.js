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
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
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
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
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

  let salesContainer = document.querySelector('#sales-section');

  // Si la section n'existe pas encore, on la crée
  if (!salesContainer) {
    salesContainer = document.createElement('section');
    salesContainer.id = 'sales-section';
    salesContainer.innerHTML = '<h2>Vinted Sales</h2>';
    document.body.appendChild(salesContainer);
  }

  // Vérifier si on a bien des ventes à afficher
  if (!sales || sales.length === 0) {
    console.warn('No sales available');
    salesContainer.innerHTML = '<h2>Vinted Sales</h2><p>No sales available</p>';
    return;
  }

  // Générer le HTML des ventes
  const salesHTML = sales.map(sale => `
    <div class="sale">
      <span><strong>${sale.title}</strong></span>
      <span>Price: <strong>€${sale.price}</strong></span>
      <span>Date: ${new Date(sale.published).toLocaleDateString()}</span>
      <a href="${sale.link}" target="_blank">View Sale</a>
    </div>
  `).join('');

  // Mettre à jour le contenu
  salesContainer.innerHTML = `<h2>Vinted Sales</h2>${salesHTML}`;
};

/**
 * Fetch sales for the selected Lego set
 */
const fetchSales = async (legoSetId) => {
  try {
    const url = `https://lego-api-blue.vercel.app/sales?id=${legoSetId}`;
    console.log('Fetching sales from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error('HTTP Error:', response.status, response.statusText);
      return [];
    }

    const body = await response.json();
    console.log('API Response:', body);

    if (!body.success) {
      console.error('Failed to fetch sales:', body);
      return [];
    }

    return body.data.result;
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



document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});
