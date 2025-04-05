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
 * Fetch deals depuis l'API avec pagination et tri
 * @param  {Number}  page - numéro de la page
 * @param  {Number}  size - nombre d'éléments par page
 * @param  {String}  filterBy - critère de tri (ex: best-discount, most-commented, hot-deals)
 * @return {Object} - deals + info de pagination
 */
const fetchDeals = async (page = 1, size = 6, filterBy = '') => {
  try {
    // On passe maintenant page, limit et filterBy dans l'URL
    const response = await fetch(
      `https://lego-ten.vercel.app/deals/search?limit=${size}&page=${page}&filterBy=${filterBy}`
    );
    
    const body = await response.json();

    return {
      result: body.results,
      meta: {
        count: body.total,
        currentPage: page,
        pageCount: Math.ceil(body.total / size) // calcule automatique du nombre de pages
      }
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
  div.classList.add('deal-container');

  const template = deals
    .map(deal => {
      const isFavorite = favorites.includes(deal.legoId); // check si dans favoris
      return `
  <div class="deal-card" data-id="${deal.legoId}">
    <img src="${deal.image}" alt="${deal.title}" />
    <h3>${deal.title}</h3>
    <p><strong>ID:</strong> ${deal.legoId}</p>
    <p><strong>Price:</strong> €${deal.price}</p>
    <p><strong>Discount:</strong> ${deal.discount}%</p>
    <p><strong>NbComments:</strong> ${deal.nb_comments}</p>
    <p><strong>Température:</strong> ${deal.temperature}</p>
    <p><strong>Date:</strong> ${deal.post_date}</p>
    <a href="${deal.link}" target="_blank">View</a>
    <button class="favorite-btn" data-id="${deal.legoId}">
      ${isFavorite ? '✓ Added' : 'Add to Favorites'}
    </button>
  </div>
`;

    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

//Pouvoir reconnaître le clic sur une card d'un deal
document.addEventListener('click', async (event) => {
  const card = event.target.closest('.deal-card');
  if (card) {
    const legoId = card.getAttribute('data-id');

    document.querySelectorAll('.deal-card').forEach(c => c.classList.remove('selected-card'));

    
    card.classList.add('selected-card');

    const sales = await fetchSales(legoId);
    renderSales(sales, legoId);
  }
});







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
const renderLegoSetIds = (deals) => {
  const ids = getIdsFromDeals(deals);
  const options = [`<option disabled selected value="">Select an id</option>`]
    .concat(ids.map(id => `<option value="${id}">${id}</option>`))
    .join('');

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
const sortByBestDiscount = async () => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(selectShow.value), 'best-discount');
  setCurrentDeals(deals);
render(deals.result, deals.meta);

};
document.querySelector('#best-discount').addEventListener('click', sortByBestDiscount);


/**
 * Sort deals by most commented
 */
const sortByMostCommented = async () => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(selectShow.value), 'most-commented');
  setCurrentDeals(deals);
  render(deals.result, deals.meta);
};
document.querySelector('#most-commented').addEventListener('click', sortByMostCommented);



/**
 * Sort deals by hot deals
 */
const sortByHotDeals = async () => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(selectShow.value), 'hot-deals');
  setCurrentDeals(deals);
  render(deals.result, deals.meta);
};
document.querySelector('#hot-deals').addEventListener('click', sortByHotDeals);




/**
 * Sort deals by selected criteria (price or date)
 */
const sortDeals = async () => {
  const sortValue = selectPrice.value;

  // On convertit la sélection en un filtre compréhensible pour l'API
  let filterBy = '';
  if (sortValue === 'price-asc') filterBy = 'price-asc';
  else if (sortValue === 'price-desc') filterBy = 'price-desc';
  else if (sortValue === 'date-asc') filterBy = 'date-asc';
  else if (sortValue === 'date-desc') filterBy = 'date-desc';

  const deals = await fetchDeals(currentPagination.currentPage, parseInt(selectShow.value), filterBy);
  setCurrentDeals(deals);
  render(deals.result, deals.meta);
};

selectPrice.addEventListener('change', sortDeals);





/**
 * Display Vinted sales
 */
const renderSales = (sales, legoSetId) => {
  let salesContainer = document.querySelector('#vinted-sales-section');

  if (!salesContainer) {
    salesContainer = document.createElement('section');
    salesContainer.id = 'vinted-sales-section';
    document.body.appendChild(salesContainer);
  }

  salesContainer.innerHTML = `<h2>Vinted Sales for Set ID: ${legoSetId}</h2>`;


  if (!sales || sales.length === 0) {
    document.querySelector('#nbSales').textContent = '0';
    salesContainer.innerHTML += '<p>No sales available</p>';
    return;
  }

  sales.sort((a, b) => new Date(a.published) - new Date(b.published));

  const salesHTML = sales.map(sale => `
    <div class="sale">
      <span><strong>${sale.title}</strong></span>
      <span>Price: <strong>€${sale.price}</strong></span>
      <span>Date: ${new Date(sale.published).toLocaleDateString()}</span>
      <a href="${sale.link}" target="_blank">View Sale</a>
    </div>
  `).join('');
  
  salesContainer.innerHTML = `
    <h2>Vinted Sales for Set ID: ${legoSetId}</h2>
    ${salesHTML}
  `;
  
  // Appelle maintenant les vrais stats depuis l’API
  fetchIndicators(legoSetId);
};

const fetchIndicators = async (legoSetId) => {
  try {
    const response = await fetch(`https://lego-ten.vercel.app/sales/indicators?legoSetId=${legoSetId}`);
    const data = await response.json();

    document.querySelector('#nbSales').textContent = data.count || 0;
    document.querySelector('#p5Price').textContent = data.p5?.toFixed(2) || '0';
    document.querySelector('#p25Price').textContent = data.p25?.toFixed(2) || '0';
    document.querySelector('#p50Price').textContent = data.p50?.toFixed(2) || '0';
    document.querySelector('#lifetimeValue').textContent = `${Math.floor(data.lifetimeDays || 0)} days`;
  } catch (err) {
    console.error('Erreur fetchIndicators:', err);
  }
};




/**
 * Fetch sales for the selected Lego set
 */
const fetchSales = async (legoSetId, limit = 50) => {
  try {
    const response = await fetch(
      `https://lego-ten.vercel.app/sales/search?legoSetId=${legoSetId}&limit=${limit}`
    );

    const body = await response.json();

    return body.results.map(sale => ({
      title: sale.title,
      price: parseFloat(sale.price?.amount || 0),
      published: parsePublishedTime(sale.published_time),
      link: sale.url
    }));
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
};


const parsePublishedTime = (str) => {
  if (!str || typeof str !== 'string') return null;

  // attend un format "DD/MM/YYYY HH:mm:ss"
  const [datePart, timePart] = str.split(' ');
  const [day, month, year] = datePart.split('/');

  if (!day || !month || !year || !timePart) return null;

  const isoString = `${year}-${month}-${day}T${timePart}`;
  const date = new Date(isoString);

  return isNaN(date.getTime()) ? null : date;
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
      renderSales(sales, selectedId);
    }
  });

  // Initialiser avec l'ID du set sélectionné au chargement de la page
  const initialId = selectLegoSetIds.value;
  if (initialId) {
    fetchSales(initialId).then(sales => renderSales(sales, initialId));

  }
});


/**
 * Favourites
 */
/**
 * Toggle favorite (add/remove in DB)
 */
const toggleFavorite = async (dealId) => {
  try {
    await fetch('https://lego-ten.vercel.app/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legoId: dealId })
    });

    await refreshFavorites();

    const isInFavoritesPage = document.getElementById('favorites-page')?.style.display === 'block';

    if (isInFavoritesPage) {
      // On recharge tous les deals
      const deals = await fetchDeals(1, 1000); // récupère tout pour pouvoir filtrer
      const favoriteDeals = deals.result.filter(deal => favorites.includes(deal.legoId));

      setCurrentDeals({
        result: favoriteDeals,
        meta: {
          count: favoriteDeals.length,
          currentPage: 1,
          pageCount: 1
        }
      });

      render(favoriteDeals, {
        count: favoriteDeals.length,
        currentPage: 1,
        pageCount: 1
      });

    } else {
      render(currentDeals, currentPagination);
    }

  } catch (error) {
    console.error('Erreur lors du toggle favori:', error);
  }
};





/**
 * Récupérer tous les favoris depuis l'API
 */
let favorites = [];

const refreshFavorites = async () => {
  try {
    const response = await fetch('https://lego-ten.vercel.app/favorites');
    const data = await response.json();
    favorites = data.favorites || [];
  } catch (error) {
    console.error('Erreur lors du fetch des favoris:', error);
    favorites = [];
  }
};


/**
 * Afficher uniquement les favoris
 */
document.querySelector('#filter-favorites').addEventListener('click', async () => {
  await refreshFavorites();
  const favoriteDeals = currentDeals.filter(deal => favorites.includes(deal.legoId));
  render(favoriteDeals, currentPagination);

  // Montre le bouton pour revenir à la liste complète
  document.querySelector('#show-all').style.display = 'inline-block';

  // Change le texte du bouton pour indiquer qu'on est en mode favoris
  document.querySelector('#filter-favorites').textContent = 'Favorites';
});

document.querySelector('#show-all').addEventListener('click', async () => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(selectShow.value));
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);

  // Cache le bouton et remet le texte d'origine
  document.querySelector('#show-all').style.display = 'none';
  document.querySelector('#filter-favorites').textContent = 'Show Favorites';
});


/**
 * Gérer le clic sur le bouton "Add to Favorites"
 */
document.addEventListener('click', (event) => {
  if (event.target && event.target.classList.contains('favorite-btn')) {
    const dealId = event.target.getAttribute('data-id');
    toggleFavorite(dealId);
  }
});


// Avoir toutes les pages
const showPage = (id) => {
  ['home-page', 'manual-page', 'auto-page', 'favorites-page'].forEach(pid => {
    document.getElementById(pid).style.display = (pid === id) ? 'block' : 'none';
  });
};

document.getElementById('btn-myself').addEventListener('click', async () => {
  showPage('manual-page');
  const deals = await fetchDeals();
  setCurrentDeals(deals);
  render(deals.result, deals.meta);
});

document.getElementById('btn-auto').addEventListener('click', async () => {
  showPage('auto-page');
  const bestDeals = await fetchDeals(1, 12, 'best-discount');
  const container = document.getElementById('auto-deals');
  container.innerHTML = '';
  bestDeals.result.forEach(deal => {
    const card = document.createElement('div');
    card.className = 'deal-card';
    card.innerHTML = `
      <img src="${deal.image}" alt="${deal.title}" />
      <h3>${deal.title}</h3>
      <p>€${deal.price} — ${deal.discount}%</p>
      <a href="${deal.link}" target="_blank">View</a>
    `;
    container.appendChild(card);
  });
});



//Page Do it for me 

// Fonction pour calculer un score de revente
const getResaleScore = (deal, indicators) => {
  let score = 0;
  const { p25, p50, count, lifetimeDays } = indicators;
  const price = deal.price;

  if (price < p25) score += 2;
  else if (price < p50) score += 1;

  if (lifetimeDays && lifetimeDays < 15) score += 1;
  if (count >= 5) score += 1;
  if (deal.discount >= 20) score += 1;

  return score;
};

// Fonction pour afficher les meilleurs deals dans la page auto
const renderAutoDeals = (deals) => {
  const container = document.getElementById('auto-deals');
  container.innerHTML = ''; // reset

  if (!deals.length) {
    container.innerHTML = '<p>No good deals found for resale 🤷‍♂️</p>';
    return;
  }

  const html = deals.map(deal => `
    <div class="deal-card">
      <img src="${deal.image}" alt="${deal.title}" />
      <h3>${deal.title}</h3>
      <p><strong>ID:</strong> ${deal.legoId}</p>
      <p><strong>Price:</strong> €${deal.price}</p>
      <p><strong>Discount:</strong> ${deal.discount}%</p>
      <p><strong>NbComments:</strong> ${deal.nb_comments}</p>
      <a href="${deal.link}" target="_blank">View</a>
    </div>
  `).join('');

  container.innerHTML = html;
};

// Fonction principale de la page auto
const fetchBestDeals = async () => {
  const scoredDeals = [];

  // currentDeals contient déjà les deals chargés au début
  for (const deal of currentDeals) {
    try {
      const res = await fetch(`https://lego-ten.vercel.app/sales/indicators?legoSetId=${deal.legoId}`);
      const indicators = await res.json();

      if (!indicators?.count) continue;

      const score = getResaleScore(deal, indicators);
      if (score >= 3) scoredDeals.push({ deal, score });
    } catch (e) {
      console.warn(`Erreur indicateurs pour ${deal.legoId}`);
    }
  }

  scoredDeals.sort((a, b) => b.score - a.score);
  renderAutoDeals(scoredDeals.map(d => d.deal));
};

document.getElementById('btn-auto').addEventListener('click', () => {
  showPage('auto-page');
  fetchBestDeals(); 
});


document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();
  setCurrentDeals(deals);

  render(deals.result, deals.meta); // ← ici tu passes bien les bons paramètres
});


