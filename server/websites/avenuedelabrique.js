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
          .find('span.prodl-prix span') //là ou les prix sont rangés (repérage avant sur le site)
          .text() //récupère le texte à l'intérieur 
      );

      const discount = Math.abs(parseInt( //extraction de la réduction en s'assurant que la valeur est positive
        $(element)
          .find('span.prodl-reduc')
          .text()
      ));

      // récupérer les infos de l'image
      const imgRef =  'https://www.avenuedelabrique.com/img/'+ $(element)
      .find('span.prodl-img img')
      .attr('data-src');  // Récupère l'attribut src de l'image

      return { //extraction du titre
        discount,
        price,
        'title': $(element).attr('title'),
        imgRef,
      };
    })
    .get(); // convertit tout en tableau contenant les objets price, discount et title
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns 
 */
module.exports.scrape = async url => { //Exporte la fonction scrape pour pouvoir l'utiliser dans un autre fichier
  const response = await fetch(url); //télécharge la page web

  if (response.ok) { //vérifie si la page a été téléchargée
    const body = await response.text(); // convertit la page en texte brut (HTML)

    return parse(body); //Passe le HTML téléchargé à la fonction parse, qui extrait les produits
  }

  console.error(response); 

  return null;
}; 

// ensuite fichier .js va utiliser ce module (index.js)