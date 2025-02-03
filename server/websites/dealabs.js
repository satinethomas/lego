const fetch = require('node-fetch'); //récup contenu HTML d'une page web
const cheerio = require('cheerio'); //analyser et manipuler le HTML (commme le document.querySelector)

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => { //data: chaîne de caractères contenant le HTML de la page web
  const $ = cheerio.load(data, {'xmlMode': true}); //extraire et charger le contenu HTML + cheerio pour analyser le contenu

  return $('div.prods a') // sélectionne tous les <a> qui sont dans un div avec la classe .prods
    .map((i, element) => { // parcourt tous les 'a' trouvés 
      const price = parseInt( //extraction du prix (convertit le prix en nombre entier)
        $(element)
          .find('text--b size--all-xl size--fromW3-xxl thread-price') //là ou les prix sont rangés (repérage avant sur le site)
          .text() //récupère le texte à l'intérieur 
      );

      const discount = Math.abs(parseInt( //extraction de la réduction en s'assurant que la valeur est positive
        $(element)
          .find('textBadge bRad--a-m flex--inline text--b boxAlign-ai--all-c size--all-s size--fromW3-m space--h-1 space--ml-1 space--mr-0 textBadge--green')
          .text()
      ));

      // récupérer les infos de l'image
      //const imgRef =  'https://www.avenuedelabrique.com/img/'+ $(element)
      //.find('span.prodl-img img')
      //.attr('data-src');  // Récupère l'attribut src de l'image

      return { //extraction du titre
        discount,
        price,
        'title': $(element).attr('title'),
        
      };
    })
    .get(); // convertit tout en tableau contenant les objets price, discount et title
};

/**
 * Scrape a given URL page
 * @param {String} url - URL to parse
 * @returns {Promise<Array|null>} Extracted deals
 */
module.exports.scrape = async url => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
        },
      });
  
      if (!response.ok) throw new Error('HTTP error! status: ${response.status}');
  
      const body = await response.text();
      return parse(body);
    } catch (error) {
      console.error('Error scraping ${url}:', error.message);
      return null;
    }
  }; 

// ensuite fichier .js va utiliser ce module (sandbox.js)