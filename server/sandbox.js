/* eslint-disable no-console, no-process-exit */
const avenuedelabrique = require('./websites/avenuedelabrique');
const dealabs = require('./websites/dealabs');

async function sandbox(website, url) {
  try {
    if (!website || !url) {
      console.log('You must provide both a website and an URL.');
      process.exit(1);
    }

    console.log(`browsing ${website} website`);

    let deals;

    // Switch pour choisir le site en fonction de l'argument 'website'
    switch (website.toLowerCase()) {
      case 'avenuedelabrique':
        deals = await avenuedelabrique.scrape(url);
        break;
      case 'dealabs':
        deals = await dealabs.scrape(url);
        break;
      default:
        console.log('Website not recognized. Please choose "avenuedelabrique" or "dealabs".');
        process.exit(1);
    }

    console.log(deals); // Affiche les résultats
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

// Récupère les arguments de la ligne de commande
const [,, eshop, url] = process.argv;

// Appelle la fonction sandbox avec le nom du site et l'URL en argument
sandbox(eshop, url);

