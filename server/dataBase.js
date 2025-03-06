const { MongoClient } = require('mongodb');
const dealabs = require('./websites/dealabs');
const vinted = require('./websites/vinted');

const MONGODB_URI = 'mongodb+srv://satinetms:IloveWebDesign8@cluster0.108zm.mongodb.net/lego?retryWrites=true&writeConcern=majority';
const DB_NAME = 'lego';
const COLLECTION_DEALS = 'deals';
const COLLECTION_SALES = 'sales';

/**
 * Connexion à MongoDB
 */
async function connectToDB() {
  const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  return client.db(DB_NAME);
}

/**
 * Insère les données scrappées dans MongoDB.
 * @param {Array} data - Données à insérer
 * @param {String} collectionName - Nom de la collection MongoDB
 */
async function insertToDatabase(data, collectionName) {
  if (!data || data.length === 0) {
    console.log(`Aucune donnée à insérer dans la collection ${collectionName}.`);
    return;
  }

  const db = await connectToDB();
  const collection = db.collection(collectionName);

  try {
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents insérés dans ${collectionName}.`);
  } catch (error) {
    console.error(`Erreur d'insertion dans MongoDB (${collectionName}) :`, error);
  }
}

/**
 * Scrape Dealabs et Vinted et insère les résultats dans MongoDB.
 */
async function scrapeAndStore() {
  try {
    console.log('Scraping deals from Dealabs...');
    const deals = await dealabs.scrape('https://www.dealabs.com/groupe/lego');

    if (!deals || deals.length === 0) {
      console.log('Aucun deal trouvé.');
      return;
    }

    console.log(`${deals.length} deals trouvés. Insertion en cours...`);
    await insertToDatabase(deals, COLLECTION_DEALS);

    // Extraire les IDs des sets LEGO à partir des titres des deals
    const dealIds = deals
      .map(deal => deal.title.match(/\d{4,6}/)?.[0])
      .filter(id => id);

    if (dealIds.length === 0) {
      console.log('Aucun ID LEGO valide trouvé dans les deals.');
      return;
    }

    console.log(`Recherche de ventes sur Vinted pour ${dealIds.length} sets LEGO...`);
    let allSales = [];

    for (const id of dealIds) {
      console.log(`Scraping Vinted sales for LEGO ID: ${id}...`);
      const vintedUrl = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${id}`;
      const sales = await vinted.scrape(vintedUrl, 
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'v_udt=NHBRWmNzejNHRXFSbG9rNUtabktSNGRRYnFoMS0tR2oxT3o0NFBpQkV4TVVWbC0tU3JFZW13aDJzMlNXeEVidnlpQjhtZz09; anonymous-locale=fr; anon_id=bc58de45-afb9-4028-b386-1f1caea52b0b; OptanonAlertBoxClosed=2025-02-10T12:51:06.384Z; eupubconsent-v2=CQMnAJgQMnAJgAcABBENBcFsAP_gAAAAAChQJxNX_G__bXlj8X71aftkeY1f99h7rsQxBhbJk-4FyLvW_JwX32EzNAz6pqYKmRIAu3TBIQNlHIDURUCgaogVrSDMaEyUoTNKJ6BkiFMRY2cYCFxvm4lDeQCY5vr991d52R-t7dr83dzyy4hHv3a5_2S1WJCdA48tDfv9bROb-9IOd_x8v4v4_FgAAAAAABAAAAAAAAAAAAAAAAAAABcAAABQSCCAAgABcAFAAVAA4AB4AEEAMgA1AB4AEQAJgAVQA3gB6AD8AISAQwBEgCOAEsAJoAVoAw4BlAGWANkAd8A9gD4gH2AfoBAACKQEXARgAjQBQQCoAFXALmAYoA0QBtADcAHEAQ6AkQBOwChwFHgKRAU2AtgBcgC7wF5gMNAZIAycBlwDOYGsAayA2MBt4DdQHJgOXAeOA9oCEIELwgB0ABwAJABzgEHAJ-Aj0BIoCVgE2gKfAWEAvIBiADFoGQgZGA0YBqYDaAG3AN0AeUA-QB-4EBAIGQQRBBMCDAEKwIXDgGAACIAHAAeABcAEgAPwA0ADnAHcAQCAg4CEAE_AKgAXoA6QCEAEegJFASsAmIBMoCbQFIAKTAV2AtQBdADEAGLAMhAZMA0YBpoDUwGvANoAbYA24Bx8DnQOfAeUA-IB9sD9gP3AgeBBECDAEGwIVjoJQAC4AKAAqABwAEAALoAZABqADwAIgATAAqwBcAF0AMQAbwA9AB-gEMARIAlgBNACjAFaAMMAZQA0QBsgDvAHtAPsA_YCKAIwAUEAq4BYgC5gF5AMUAbQA3ABxADqAIdAReAkQBMgCdgFDgKPgU0BTYCrAFigLYAXAAuQBdoC7wF5gL6AYaAx4BkgDJwGVQMsAy4BnIDVQGsANvAbqA4sByYDlwHjgPaAfWBAECFpAAmAAgANAA5wCxAI9ATaApMBeQDUwG2ANuAc-A8oB8QD9gIHgQYAg2BCshAcAAWABQAFwAVQAuABiADeAHoARwA7wCKAEpAKCAVcAuYBigDaAHUgU0BTYCxQFogLgAXIAycBnIDVQHjgQtJQIgAEAALAAoABwAHgARAAmABVAC4AGKAQwBEgCOAFGAK0AbIA7wB-AFXAMUAdQBDoCLwEiAKPAWKAtgBeYDJwGWAM5AawA28B7QEDyQA8AC4A7gCAAFQAR6AkUBKwCbQFJgMWAbkA8oB-4EEQIMFIG4AC4AKAAqABwAEEAMgA0AB4AEQAJgAUgAqgBiAD9AIYAiQBRgCtAGUANEAbIA74B9gH6ARYAjABQQCrgFzALyAYoA2gBuAEOgIvASIAnYBQ4CmwFigLYAXAAuQBdoC8wF9AMNAZIAyeBlgGXAM5gawBrIDbwG6gOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWAAA.f_wAAAAAAAAA; OTAdditionalConsentString=1~43.46.55.61.70.83.89.93.108.117.122.124.135.143.144.147.149.159.192.196.211.228.230.239.259.266.286.291.311.318.320.322.323.327.367.371.385.394.407.415.424.430.436.445.486.491.494.495.522.523.540.550.559.560.568.574.576.584.587.591.737.802.803.820.821.839.864.899.904.922.931.938.979.981.985.1003.1027.1031.1040.1046.1051.1053.1067.1092.1095.1097.1099.1107.1135.1143.1149.1152.1162.1166.1186.1188.1205.1215.1226.1227.1230.1252.1268.1270.1276.1284.1290.1301.1307.1312.1345.1356.1375.1403.1415.1416.1421.1423.1440.1449.1455.1495.1512.1516.1525.1540.1548.1555.1558.1570.1577.1579.1583.1584.1591.1603.1616.1638.1651.1653.1659.1667.1677.1678.1682.1697.1699.1703.1712.1716.1721.1725.1732.1745.1750.1765.1782.1786.1800.1810.1825.1827.1832.1838.1840.1842.1843.1845.1859.1866.1870.1878.1880.1889.1899.1917.1929.1942.1944.1962.1963.1964.1967.1968.1969.1978.1985.1987.2003.2008.2027.2035.2039.2047.2052.2056.2064.2068.2072.2074.2088.2090.2103.2107.2109.2115.2124.2130.2133.2135.2137.2140.2147.2150.2156.2166.2177.2186.2205.2213.2216.2219.2220.2222.2225.2234.2253.2279.2282.2292.2305.2309.2312.2316.2322.2325.2328.2331.2335.2336.2337.2343.2354.2358.2359.2370.2376.2377.2387.2400.2403.2405.2407.2411.2414.2416.2418.2425.2440.2447.2461.2465.2468.2472.2477.2481.2484.2486.2488.2493.2498.2501.2510.2517.2526.2527.2532.2535.2542.2552.2563.2564.2567.2568.2569.2571.2572.2575.2577.2583.2584.2596.2604.2605.2608.2609.2610.2612.2614.2621.2628.2629.2633.2636.2642.2643.2645.2646.2650.2651.2652.2656.2657.2658.2660.2661.2669.2670.2677.2681.2684.2687.2690.2695.2698.2713.2714.2729.2739.2767.2768.2770.2772.2784.2787.2791.2792.2798.2801.2805.2812.2813.2816.2817.2821.2822.2827.2830.2831.2834.2838.2839.2844.2846.2849.2850.2852.2854.2860.2862.2863.2865.2867.2869.2873.2874.2875.2876.2878.2880.2881.2882.2883.2884.2886.2887.2888.2889.2891.2893.2894.2895.2897.2898.2900.2901.2908.2909.2916.2917.2918.2919.2920.2922.2923.2927.2929.2930.2931.2940.2941.2947.2949.2950.2956.2958.2961.2963.2964.2965.2966.2968.2973.2975.2979.2980.2981.2983.2985.2986.2987.2994.2995.2997.2999.3000.3002.3003.3005.3008.3009.3010.3012.3016.3017.3018.3019.3025.3028.3034.3038.3043.3052.3053.3055.3058.3059.3063.3066.3068.3070.3073.3074.3075.3076.3077.3089.3090.3093.3094.3095.3097.3099.3100.3106.3109.3112.3117.3119.3126.3127.3128.3130.3135.3136.3145.3150.3151.3154.3155.3163.3167.3172.3173.3182.3183.3184.3185.3187.3188.3189.3190.3194.3196.3209.3210.3211.3214.3215.3217.3219.3222.3223.3225.3226.3227.3228.3230.3231.3234.3235.3236.3237.3238.3240.3244.3245.3250.3251.3253.3257.3260.3270.3272.3281.3288.3290.3292.3293.3296.3299.3300.3306.3307.3309.3314.3315.3316.3318.3324.3328.3330.3331.3531.3731.3831.4131.4531.4631.4731.4831.5231.6931.7235.7831.7931.8931.9731.10231.10631.10831.11031.11531.12831.13632.13731.14034.14237.14332.15731.16831.16931.21233.23031.25131.25731.25931.26031.26831.27731.27831.28031.28731.28831.29631.31631.32531.33631.34231.34631.36831.39131.39531.40632.41531; _gcl_au=1.1.1011209921.1739191867; _ga=GA1.1.184013894.1739191867; _lm_id=9RKH7QR6FM3HSTP8; _fbp=fb.1.1739191867039.448640803191390596; _tt_enable_cookie=1; _ttp=PUGVGjPnCzGdQFEhUmyEaMcoxj0.tt.1; _uetvid=b1ec7be0e7ad11efa4c945799e48fc70; domain_selected=true; v_sid=5ffc4af0-1741006623; v_sid=5ffc4af0-1741006623; __cf_bm=XP1T766yvJmcKp3cqQbdZ_x8oL24WfiJNjFIZgtHmBg-1741262414-1.0.1.1-UCoV0xVtYEJIaM.VS4vTb9kmXbO8ZI4fwXyvhtztZ0QrLMwG0O84L2RXxNl9dVQg4swwjPGmMev7zKCUkz3dYKA11m1F_y3v9HWii8gMoGe84QQ6OdfNz5G7H.WAjBg9; cf_clearance=iDb6tfS75mVzj7wy1VDvc6OGlqMfq_LKF7tZ6moyqMY-1741262414-1.2.1.1-87_gFEFGR4IKQWVxYiBEEG2MzM6oCjHCtMt9hFRbjyNYATPQCYKJy9WTiu1NFOnnAuWif8R7w6M8PPk06EtwhnQ7P3m4Q7SMakM1xBjtj92dRpIyZz3PLAn6F.GQliO8T9HOYh29okKo8AxR75xKUZB3_JJb4zXJjYdr3.AfM3rdqJDWT2E6G4WrBAk0MdmSjOdfLITeSpYSpJEVjqlw9cBW_.XP7p8ULKrrkEVcIGEgiWN09o_Vn.iNRSuiDZKGBFgA7rUA7754ewMJE5qoiIc3heYlSE1I_p.U7axp5YtgVeXURDu5QO3MvMWsDsc1JO5cYpEwnw4wEnp55CbDfVOVBedaKDmqeRWKvajjnXjr7L.Eq652x3KOgnp17LWZb42MtCBhNzOjHgr9cG3WPSWqWOCVQPHG_ZD_ek0D7Hw; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMjYyNDE0LCJzaWQiOiI1ZmZjNGFmMC0xNzQxMDA2NjIzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDEyNjk2MTQsInB1cnBvc2UiOiJhY2Nlc3MifQ.Ese0R0sKQ7Qr83c5rI_JFBDWX-N4IggsQADoSMOFLVWnfndSuX-_UGnLLTCgZMa4kcHu-6rOLi2guh0xPWFi9ESU3swDIU2_InNt2JnQ-eARWrUJr_JUaFgobsoiC_QBnG8WNA4UQ7BZn84KsAG3nnbNxmehPtTA4a3W_f0oRc06qwhYAE3-9qGRHP4Y8LvOjUQNKHgM8LvGxrLuQgRe_s0xvKs5kMFWcqSJ1cah4Zq2tnV_ZxyWP5Rm4VgjLKif-MQ6eQC_m_Ow8hGekqitR-u7beLN3gcvvLIJf98ridc0xKfyR8pOQoGhFa_EtkcrAqDaJUI4qeehsIdzNATFZg; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMjYyNDE0LCJzaWQiOiI1ZmZjNGFmMC0xNzQxMDA2NjIzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE4NjcyMTQsInB1cnBvc2UiOiJyZWZyZXNoIn0.FqoqXblYXQjikoMCT8VaGbGuRn24uAtJcsfpMCYWu28G6oT0NLNsZxR1Wm2H03swYHW9zEJ97pEuH14CIKSWjnogG9KR7eX98ccn5s5a3k3bBhkNwSl5eKxf5ASMd9GtR2Dkxfe_3S9_NYhwpYz4Iha5-2HPi3XpcQasL-PpDLDdHECX4vqA3MlxE_rqDFJ1RmS0WJoQUiGvjwj2F-UhrBikAMsrmyxK_LSsBXVMWJZxB-W0mBJ2epiO71Q0VJIG9LeJ5pbC75xbn5uDwzJ9YXm88K9hlzlF5dm8qTjnlkOo-B9PoaUwljxYWNhvZgS9TvUc2Tps0IaX-UMeGymMeg; __gads=ID=a66396c3cb88363a:T=1739191870:RT=1741262421:S=ALNI_MachQUA8wkkjG0tREiezJnn2zJOkQ; __eoi=ID=22600533c313a705:T=1739191870:RT=1741262421:S=AA-AfjaDO9dc8JLhjdS_WY1WwIw8; cto_bundle=TT9grF9QT2luRzc3NXR6WVZ2YVROdjNGV0xLNWEwMTk0Z2swdm4xQjBOUFJxSDhqYzM0d0hnRHdta1BXTk9pMFNGSlhlU1ZpOWFUJTJGN0NFcnljOERTTTglMkI3VkoybERQMmF4WVVPR1V0UVBjbSUyQiUyQk1od1I4MjBFZk00VEtlbmIweCUyRkpXcHlHRHBZTzBCJTJCc0dFRlM1dVpMR0Q1V2clM0QlM0Q; viewport_size=539; datadome=pbUV~BfcGnDQhSa_~hqNhSgDfZhjQXGZVDmISYtj8zc1bzieKwutxc0o_EBjcKsHjFw6CXKLcHC0yFr_8zfTGRMfeOSq7YruQ8Pu35QtjKiSn0a~IHLQ4TXoTr9lqsE3; OptanonConsent=isGpcEnabled=0&datestamp=Thu+Mar+06+2025+13%3A00%3A38+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=bc58de45-afb9-4028-b386-1f1caea52b0b&interactionCount=26&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0005%3A1%2CV2STACK42%3A1%2CC0015%3A1%2CC0035%3A1&genVendors=V2%3A1%2CV1%3A1%2C&AwaitingReconsent=false&geolocation=FR%3BIDF; _dd_s=rum=2&id=4f5a1198-89c4-4755-a658-bf1b9c2276d1&created=1741262414818&expire=1741263338483; _ga_8H12QY46R8=GS1.1.1741262415.10.1.1741262438.0.0.0; _ga_ZJHK1N3D75=GS1.1.1741262415.10.1.1741262438.0.0.0; _vinted_fr_session=a0VUdUhCZTZOOVZtcDlqQlJNbzdSL2VBZEZnZEhXdlhISUFkRWRORUM0bzN4T1VPd2pHNU9HRWNUNVRWQVdaM2JPNExUcjJzUnNjNGprbkwwZmxQV1VBNjVlYkU2SUxkYmF0aGtEenlzbWxNZURHdHVYQ3ZzTXFCUHgrNGFibXhyRzVxNjBVdjR2NCthVmVwRlEyVGxWM2dvTW5pRnlCV1VhMFpsZGg3MldMVmd1MUlPZmpReS9pTGd5SlgxRHBJaGNjUERtUlVNQXNvZzBjT3FYNzVscHlROW5GOEZ1QzNVSkRPRXBRRndiU3BGM0RjM09LRUxzMDBzaXViakdzaThQZDJvVzJRenNIc3RYQ09XNDFnVDVIOElwcFZGaVZucHl4MVBSMlo1YlVhaC83dXMvb2hUVm5vUnhkd2U2VTRHUUtOM09XKytZeVJMM0RXYTdaeWxpZEZKTHdBaVlZK3BhWGtQVzM2N3JIRUU2SFVPYkMxSHpPM09oanhxQ3NCMElwR1drVm13b1RjZUVvc3hWbE9EeVo4ZWJ5cTBoR0hxc1k1ZTlYbGFxL0ZqWE5Lb3Q4bUdjS1lkOFNXWlkrbHVZY0lPZXM5Skx5ZG1WVENPVUsxenhYUERRbkhuUEkyUEhXc0R6aW5MRVBIZ01xZ005NGR4VGhmM0RjRUdZN2JHZVJOcUJ5Q2RmYitPV3k2ejhqZkxRbzZVTkttZVFqd25DYkk2b3FxSkloT3VKUzQxYzFsYzZVeGxBTEV5SXpkaDNHY3VpRmtidzVTeHlBc1dpc0NSdzg3NU9maUk1WWhPZDhVTFpCSzRSS2ZnSVpsRGI5NDJDM2xodFE1RWhLOGUrNFdrYW9BRHNSbS91M0s1KzhrZDFWV0tPT3NuV1VPa1dzd0xDbThmODVSNGdETnlGSjBYRmN4aCtmMVV6cTFvVHJUdWk5aStEd3NCcHJTM2ZKdTdpVHFaTFlENkh1OEw0RGxvQmFRRThOQ1VHcFdleTZWTHloQkMrUzRNeXpqSjBRYlFmMmJkYjJmbXVZUll3Z0d2YlNVNVVid253UlozKy9VN2VPR3BzZ1krRnFrSExTZVppbmtNZ1lSdTRWY1RYNkxoUVdTVWZ1NGZhSzVMMWNFYlJWZXRiRi9XS2Z3UFZobVFIM0dKNmk5MndQMU0vYXUxK2hpeXFObGxBckh0RExRdDFWQ2N2WmcrY3JEbUVHRDFnSGNWM0N1ODBzNllnNjRySjN4RmxsenFLVnkwRDA5NXNJSWdPQ0U1citSbXRQKy9hTmFCNmdGbzI4MmRHQ0RuU09YcUdXenBpczNUaVFzOHREak80U1h3WGI4cWhLT21UTDR5L0daaVJsV0dhZnI4MVFWS3pMQWx2QWcwdEFVWnlNZWI2Ny9JaGRHQlZNMHgrc0VROHdIc1h5by9ON29IZ2dxNWpWUXVJZDNybHlPZFRqZ2VNaDFqbHlnMjJTL1hGM2MwRjdnYlc4OEgyTElvR0Mya1R0dGlteEhGTnJ2aGV2NTNaallYWU5sdlBsazRFd1dld21YSGlETkE0Kzc1RmlhZ0w5VURZb2xwTlNoRWJlZzMxUWdlUGVSeXpyOU5iRGVlRmVPMmdZcGR0SUY1OGE0UEZMSFNzQ0xLVnhDOTBxYVVVZWpjSys0K1djVStLNnpkcG92bmZmVGZUYUxOYXU4UFg1YlBvSGRIejZUQmdhOVpsclBmOFdJelNCcWFtZm11N0N6ZU1hOVVhc2tJSGhTNVoxZUdaeGFJZGptVzZHa3hYaU5VVnRoYmpYc3NFZVRWYXVnMzJES0hSUHZvWFdrek40M3FYTWhUYm5EdXptb3FPc3ArbUlJK2pISHFaNUovZk1TVG02ZHBnZHZTd0N2Syt6K1Mzbk1ubDBmY2hqMlpNSlB0cktzN3pXUng3YVMrMWR5OTNyYmdmbEVKYk9oVWowT0ljVFBEejUrdnI2Q3NHeE5EOWhwdytaTzBPejVzYld5alRtRTRTYU9lSW9WcVhLM3pBVFNBUkFSNW9BM1h3VkFkVSthMHE3QmZyWlRFRkdPdjhkWVMyUklrT1h6Y3o3d3RuSE4yRjJ3NEs1UVFMVU1uOXIrTCt3ZDBqR3dOYmxSWUFxKzk3a21OMUtRSnQyNWJISUZFb2gzVEtCTE5La2o5YkloUFRKMWtocVcxUUxyallaR25wWVFWWEhURk51MElpQ0dORmFVU2k2eC8yS2hCTHRjZUdWYy9IekNLOTZGbi9wSnBITEUwUURoeHkyUlFCR21RRkFNczJ5ckxscGVvcWR6Y3RUMDNDUWdVTkNGYUhmZUxuQWR6ZWVBaHVkdEdWQ1k4ZXFRM0J1QVVGYnp6VG84NmFQY3M2QkpIYWtwUkhXdC0tSmlld3FGY2dZdHpaVTcwWnQ3TkJnQT09--940ac4a5a0437620d42a468eceedd9d58e4cd55b; banners_ui_state=PENDING'
      );

      if (sales && sales.length > 0) {
        // Filtrer uniquement les articles LEGO
        const legoSales = sales.filter(sale => sale.brand_title && sale.brand_title.toUpperCase() === 'LEGO');

        if (legoSales.length > 0) {
          allSales = allSales.concat(legoSales);
        }
      }
    }

    if (allSales.length > 0) {
      console.log(`${allSales.length} ventes LEGO trouvées sur Vinted. Insertion en cours...`);
      await insertToDatabase(allSales, COLLECTION_SALES);
    } else {
      console.log('Aucune vente LEGO trouvée sur Vinted.');
    }

  } catch (error) {
    console.error('Erreur lors du scraping et de l\'insertion :', error);
  }
}

/** MÉTHODES DE RECHERCHE **/

/**
 * Trouve les meilleures réductions disponibles
 */
async function findBestDiscountDeals() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  const deals = await collection.find({ discount: { $ne: null } }).sort({ discount: -1 }).toArray();
  console.log('Best discount deals:', deals);
  return deals;
}

/**
 * Trouve les deals les plus commentés
 */
async function findMostCommentedDeals() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  const deals = await collection.find().sort({ nb_comments: -1 }).toArray();
  console.log('Most commented deals:', deals);
  return deals;
}

/**
 * Trie les deals par prix (croissant)
 */
async function findDealsSortedByPrice() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  const deals = await collection.find().sort({ price: 1 }).toArray();
  console.log('Deals sorted by price:', deals);
  return deals;
}

/**
 * Trie les deals par date d'ajout (du plus récent au plus ancien)
 */
async function findDealsSortedByDate() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  const deals = await collection.find().sort({ _id: -1 }).toArray(); // _id = date d'ajout
  console.log('Deals sorted by date:', deals);
  return deals;
}

/**
 * Trouve toutes les ventes pour un ID LEGO donné
 * @param {String} legoSetId - Identifiant du set LEGO
 */
async function findSalesByLegoSetId(legoSetId) {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_SALES);
  const sales = await collection.find({ title: { $regex: legoSetId, $options: 'i' } }).toArray();
  console.log(`Sales for LEGO set ${legoSetId}:`, sales);
  return sales;
}

/**
 * Trouve toutes les ventes ajoutées il y a moins de 3 semaines
 */
async function findRecentSales() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_SALES);
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  const sales = await collection.find({ _id: { $gte: threeWeeksAgo } }).toArray();
  console.log('Recent sales (last 3 weeks):', sales);
  return sales;
}

/**
 * Exemple d'utilisation
 */
async function runQueries() {
  await findBestDiscountDeals();
  await findMostCommentedDeals();
  await findDealsSortedByPrice();
  await findDealsSortedByDate();
  await findSalesByLegoSetId('10323'); // ID à remplacer
  await findRecentSales();
}

// Décommente pour tester les requêtes
runQueries();

// Lancer le scraping et l'insertion
scrapeAndStore();
