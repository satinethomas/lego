const fs = require('fs');
const dealabs = require('./websites/dealabs');
const vinted = require('./websites/vinted');

/**
 * Scrape les offres Dealabs et les ventes correspondantes Vinted.
 * @param {String} dealabsUrl - URL à scraper sur Dealabs.
 */
async function scrapeDealsAndVinted(dealabsUrl) {
  try {
    console.log(`Scraping ${dealabsUrl} for deals...`);

    // Scraper les offres depuis Dealabs
    const deals = await dealabs.scrape(dealabsUrl);

    if (!deals || deals.length === 0) {
      console.log('No deals found on Dealabs.');
      return;
    }

    console.log(`Found ${deals.length} deals on Dealabs.`);

    // Extraire les IDs des offres de Dealabs (en supposant que l'ID est une chaîne de 4 à 6 chiffres)
    const dealabsIds = deals.map(deal => {
      // Si l'ID de l'offre est extrait d'une chaîne de caractères ou d'un champ particulier
      const match = deal.title.match(/\d{4,6}/); // Match un ID de 4 à 6 chiffres
      return match ? match[0] : null;
    }).filter(id => id !== null);

    if (dealabsIds.length === 0) {
      console.log('No valid Dealabs IDs found.');
      return;
    }

    console.log(`Found ${dealabsIds.length} valid Dealabs IDs.`);

    // User-Agent et cookie à utiliser pour Vinted - cookie get
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
    const cookie = 'v_udt=NHBRWmNzejNHRXFSbG9rNUtabktSNGRRYnFoMS0tR2oxT3o0NFBpQkV4TVVWbC0tU3JFZW13aDJzMlNXeEVidnlpQjhtZz09; anonymous-locale=fr; anon_id=bc58de45-afb9-4028-b386-1f1caea52b0b; OptanonAlertBoxClosed=2025-02-10T12:51:06.384Z; eupubconsent-v2=CQMnAJgQMnAJgAcABBENBcFsAP_gAAAAAChQJxNX_G__bXlj8X71aftkeY1f99h7rsQxBhbJk-4FyLvW_JwX32EzNAz6pqYKmRIAu3TBIQNlHIDURUCgaogVrSDMaEyUoTNKJ6BkiFMRY2cYCFxvm4lDeQCY5vr991d52R-t7dr83dzyy4hHv3a5_2S1WJCdA48tDfv9bROb-9IOd_x8v4v4_FgAAAAAABAAAAAAAAAAAAAAAAAAABcAAABQSCCAAgABcAFAAVAA4AB4AEEAMgA1AB4AEQAJgAVQA3gB6AD8AISAQwBEgCOAEsAJoAVoAw4BlAGWANkAd8A9gD4gH2AfoBAACKQEXARgAjQBQQCoAFXALmAYoA0QBtADcAHEAQ6AkQBOwChwFHgKRAU2AtgBcgC7wF5gMNAZIAycBlwDOYGsAayA2MBt4DdQHJgOXAeOA9oCEIELwgB0ABwAJABzgEHAJ-Aj0BIoCVgE2gKfAWEAvIBiADFoGQgZGA0YBqYDaAG3AN0AeUA-QB-4EBAIGQQRBBMCDAEKwIXDgGAACIAHAAeABcAEgAPwA0ADnAHcAQCAg4CEAE_AKgAXoA6QCEAEegJFASsAmIBMoCbQFIAKTAV2AtQBdADEAGLAMhAZMA0YBpoDUwGvANoAbYA24Bx8DnQOfAeUA-IB9sD9gP3AgeBBECDAEGwIVjoJQAC4AKAAqABwAEAALoAZABqADwAIgATAAqwBcAF0AMQAbwA9AB-gEMARIAlgBNACjAFaAMMAZQA0QBsgDvAHtAPsA_YCKAIwAUEAq4BYgC5gF5AMUAbQA3ABxADqAIdAReAkQBMgCdgFDgKPgU0BTYCrAFigLYAXAAuQBdoC7wF5gL6AYaAx4BkgDJwGVQMsAy4BnIDVQGsANvAbqA4sByYDlwHjgPaAfWBAECFpAAmAAgANAA5wCxAI9ATaApMBeQDUwG2ANuAc-A8oB8QD9gIHgQYAg2BCshAcAAWABQAFwAVQAuABiADeAHoARwA7wCKAEpAKCAVcAuYBigDaAHUgU0BTYCxQFogLgAXIAycBnIDVQHjgQtJQIgAEAALAAoABwAHgARAAmABVAC4AGKAQwBEgCOAFGAK0AbIA7wB-AFXAMUAdQBDoCLwEiAKPAWKAtgBeYDJwGWAM5AawA28B7QEDyQA8AC4A7gCAAFQAR6AkUBKwCbQFJgMWAbkA8oB-4EEQIMFIG4AC4AKAAqABwAEEAMgA0AB4AEQAJgAUgAqgBiAD9AIYAiQBRgCtAGUANEAbIA74B9gH6ARYAjABQQCrgFzALyAYoA2gBuAEOgIvASIAnYBQ4CmwFigLYAXAAuQBdoC8wF9AMNAZIAyeBlgGXAM5gawBrIDbwG6gOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWAAA.f_wAAAAAAAAA; OTAdditionalConsentString=1~43.46.55.61.70.83.89.93.108.117.122.124.135.143.144.147.149.159.192.196.211.228.230.239.259.266.286.291.311.318.320.322.323.327.367.371.385.394.407.415.424.430.436.445.486.491.494.495.522.523.540.550.559.560.568.574.576.584.587.591.737.802.803.820.821.839.864.899.904.922.931.938.979.981.985.1003.1027.1031.1040.1046.1051.1053.1067.1092.1095.1097.1099.1107.1135.1143.1149.1152.1162.1166.1186.1188.1205.1215.1226.1227.1230.1252.1268.1270.1276.1284.1290.1301.1307.1312.1345.1356.1375.1403.1415.1416.1421.1423.1440.1449.1455.1495.1512.1516.1525.1540.1548.1555.1558.1570.1577.1579.1583.1584.1591.1603.1616.1638.1651.1653.1659.1667.1677.1678.1682.1697.1699.1703.1712.1716.1721.1725.1732.1745.1750.1765.1782.1786.1800.1810.1825.1827.1832.1838.1840.1842.1843.1845.1859.1866.1870.1878.1880.1889.1899.1917.1929.1942.1944.1962.1963.1964.1967.1968.1969.1978.1985.1987.2003.2008.2027.2035.2039.2047.2052.2056.2064.2068.2072.2074.2088.2090.2103.2107.2109.2115.2124.2130.2133.2135.2137.2140.2147.2150.2156.2166.2177.2186.2205.2213.2216.2219.2220.2222.2225.2234.2253.2279.2282.2292.2305.2309.2312.2316.2322.2325.2328.2331.2335.2336.2337.2343.2354.2358.2359.2370.2376.2377.2387.2400.2403.2405.2407.2411.2414.2416.2418.2425.2440.2447.2461.2465.2468.2472.2477.2481.2484.2486.2488.2493.2498.2501.2510.2517.2526.2527.2532.2535.2542.2552.2563.2564.2567.2568.2569.2571.2572.2575.2577.2583.2584.2596.2604.2605.2608.2609.2610.2612.2614.2621.2628.2629.2633.2636.2642.2643.2645.2646.2650.2651.2652.2656.2657.2658.2660.2661.2669.2670.2677.2681.2684.2687.2690.2695.2698.2713.2714.2729.2739.2767.2768.2770.2772.2784.2787.2791.2792.2798.2801.2805.2812.2813.2816.2817.2821.2822.2827.2830.2831.2834.2838.2839.2844.2846.2849.2850.2852.2854.2860.2862.2863.2865.2867.2869.2873.2874.2875.2876.2878.2880.2881.2882.2883.2884.2886.2887.2888.2889.2891.2893.2894.2895.2897.2898.2900.2901.2908.2909.2916.2917.2918.2919.2920.2922.2923.2927.2929.2930.2931.2940.2941.2947.2949.2950.2956.2958.2961.2963.2964.2965.2966.2968.2973.2975.2979.2980.2981.2983.2985.2986.2987.2994.2995.2997.2999.3000.3002.3003.3005.3008.3009.3010.3012.3016.3017.3018.3019.3025.3028.3034.3038.3043.3052.3053.3055.3058.3059.3063.3066.3068.3070.3073.3074.3075.3076.3077.3089.3090.3093.3094.3095.3097.3099.3100.3106.3109.3112.3117.3119.3126.3127.3128.3130.3135.3136.3145.3150.3151.3154.3155.3163.3167.3172.3173.3182.3183.3184.3185.3187.3188.3189.3190.3194.3196.3209.3210.3211.3214.3215.3217.3219.3222.3223.3225.3226.3227.3228.3230.3231.3234.3235.3236.3237.3238.3240.3244.3245.3250.3251.3253.3257.3260.3270.3272.3281.3288.3290.3292.3293.3296.3299.3300.3306.3307.3309.3314.3315.3316.3318.3324.3328.3330.3331.3531.3731.3831.4131.4531.4631.4731.4831.5231.6931.7235.7831.7931.8931.9731.10231.10631.10831.11031.11531.12831.13632.13731.14034.14237.14332.15731.16831.16931.21233.23031.25131.25731.25931.26031.26831.27731.27831.28031.28731.28831.29631.31631.32531.33631.34231.34631.36831.39131.39531.40632.41531; _gcl_au=1.1.1011209921.1739191867; _ga=GA1.1.184013894.1739191867; _lm_id=9RKH7QR6FM3HSTP8; _fbp=fb.1.1739191867039.448640803191390596; _tt_enable_cookie=1; _ttp=PUGVGjPnCzGdQFEhUmyEaMcoxj0.tt.1; _uetvid=b1ec7be0e7ad11efa4c945799e48fc70; domain_selected=true; v_sid=5ffc4af0-1741006623; __cf_bm=yA71sO_cthESyseY17cmyp7XvHpJ_qbZj6ew0RwubWE-1741698833-1.0.1.1-ciFtFvJOGZ1xJB8Gi_WXvcEYNGYB70Ja9b5k0Br_f6qRpN21qYJgRQTt3jd4sQEvdtqIySg4BwSVW4e4fuzVOVT.RZUauvDDphedo296y5zfAieNViYT0MkeM_NbMyht; cf_clearance=4FBuNOLafOh8pFZ92J4C5lWx0T5S2ahIHtjxpnHYwS0-1741698834-1.2.1.1-U8cIORnSYMFpTLRkaUkm3OyIOdUPg2tFvPVB1hycs._vw.uO4PRX26BCWEhFrn4SBtqqEnBW5zBRksq.V8lzCOmGbdSygIGmrtHWNPVHX8C8aZVKnM4K6CArg3V48lhy2t0sdMucuNyOENdvtNDabtpugQBHavbyDbDeN5Qv0lpbaibBOEgWkfz087kS2lR0UjQoRMObOebb..6mYPy8f3.TcwyE0WWzWhLv4QdnETh_uzeA_6FAYBEKgHGlxLvneYQ24TKrgksZXWey0C2eF3F1STtMQjx_B0Tj6Kko_PxK2Y3u_Gna9wTFychSk0iLRiNV2O4KFZZhuMB1xvGoRJDgi6huegDxwoyUmjGkHzY; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjk4ODM0LCJzaWQiOiI1ZmZjNGFmMC0xNzQxMDA2NjIzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE3MDYwMzQsInB1cnBvc2UiOiJhY2Nlc3MifQ.MPbOO9HKAOD-ysgm8X31_5o-dbkHqwVz3UV0sSfGhZuznObv7glhr-MxCixQkaf1ThcOUnV4-WUFS3_wRRfZdsmbo0ZiHYLVrTsF9tOPcSYsmBccJfgPb8r8hpl3TE6gO6aqdaePJdRScKTQvfbNs3AYtDUMwNVz8uDNXAkT2Ob2ezQie6il9Ev4TioNMG2N_O7qsxgfRqEGUPMTe_cKyOsCUVEgA3EDsEDmdEgFuWFG709pIzT4CSe68524IymxP4cL2Ii_wB7F9HTkHYIW635A_Jg_0haXJx19pIt0qsOHIr8YRSxmOKmtPsthfE1k0tpSLI9Nk6LKaaNBbabr8Q; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjk4ODM0LCJzaWQiOiI1ZmZjNGFmMC0xNzQxMDA2NjIzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDIzMDM2MzQsInB1cnBvc2UiOiJyZWZyZXNoIn0.PH0elWa5msIoAWTP5ZIUiFGV8qf0n-xXbmnKhhSWbsS7WtY_EmdU3FHqEjPCHRwwHMjxgnfp1DsWrmSyPzlG-a-drAoJbJQJVi2sgA9GR497OmlNK1Cr5jMM7b-vQqfu81np8DzG1PyDsapV3iPk4s5492-tERNlURGJKC-iGKarCxUWZjDLMIUilSdaQq1sHBFWYxiEzu6Vv11W682zRDjn7dg55t_W9nFnXadkWBGyD2CseQyQEJfZ5Ouwa0E-_QPc-xTxsUFcfmJjXNMKFXCuAI8ZewFXrleCIyk51-f0eSNUDsqKTk3Drhd8SuItwuSC3OzirMhW_9Z9radYfw; __gads=ID=a66396c3cb88363a:T=1739191870:RT=1741698844:S=ALNI_MachQUA8wkkjG0tREiezJnn2zJOkQ; __eoi=ID=22600533c313a705:T=1739191870:RT=1741698844:S=AA-AfjaDO9dc8JLhjdS_WY1WwIw8; cto_bundle=43NKJ184YlQ1c0VzQ21sdW5lbnklMkY5V1FuWHlYRTdIaHcxTmJiSm52Q1E1aldldG1VZ0FYJTJCcUU0anBmMkg0YmFaQ2olMkJKMGhKU25BUEs0WXUyRSUyRmQyZWJCcHFoVEpXcFF4cVhqeXBjNkNOT3N6VEtFeFUwcERqYVo4SXl6amVwWkdROUZFdWZJeVJEc2VIZHFXM3JQMkI5WVVQdyUzRCUzRA; viewport_size=539; datadome=xMRCKzzv5t8X~EfBdzraxPHaJrD_TIm5pDOx7iDDsNJv4vxReYKRwHfo1589VuwOTqr~jSvVf43ZlV8Yy1zV70QuZ~nNGRqd543lQZ~WF1qfOpDXmBZPtTfTivBh6jOl; _ga_8H12QY46R8=GS1.1.1741698834.12.1.1741698857.0.0.0; _ga_ZJHK1N3D75=GS1.1.1741698834.12.1.1741698857.0.0.0; OptanonConsent=isGpcEnabled=0&datestamp=Tue+Mar+11+2025+14%3A14%3A18+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=bc58de45-afb9-4028-b386-1f1caea52b0b&interactionCount=61&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0005%3A1%2CV2STACK42%3A1%2CC0015%3A1%2CC0035%3A1&genVendors=V2%3A1%2CV1%3A1%2C&AwaitingReconsent=false&geolocation=FR%3BIDF; _vinted_fr_session=cjF4NnUwS0g1NTYwSXBuOVAweFcxSHhWUHlIZ08xY1NNbzV2aVNaTXdTeVNrVWNabkV6T0tKTms1YXdlMFFGdnowUVlFc0hHR3hkUkhGd2EvYnJVRnRMc2pQelE2NGJpaFlSTDJ3cUtUeHNmRGpwc3QrRmtmM1Z2V1NKWEtRZlU2d1N2cVZqSGt6cmZsSUxnbGNqYWdpc3ZWRXNvaGxiQkozYVEzNlVFQmlMcFRnaEx4dlE3c2lNVzErVlphUXFXd3ZoV2Jja3Iwa2ZUWlVnRTVMajZUVzFBanc1NFRvdEN4aFZZTXpTOEkzN2JwdXhwamF1MXNWeDdmUExiKzhqNFdxYnZHZmRmekNZaHlMa0FxQ0hFTjZqNmR2dktEWVRoemh6V0g5RUxXS1Y5QWtPS2RiR1RxQzkwSnRJc2JBM3lmZnlxaFdScVVpYXlid2lZNGZ3bVplZVN1MjBFYmlkOHVkT3FtckRMRDg3Rkx4SWlaZURDMWprSURjS0hvTGIwSkRxRm9UZFR3SCtrSjFVQXN4eEhJUlh5TGVjeGhsLzNHZEt2Sis2THVYckFHeEdoNThtMGpzbEYyeno0Zy9mcEUzTUFGNnUrNlRsL3BTOEtkQjBGZmo2Z0RhSjlFOTlwMXZvaXRvK1JMaHptb0pQR1FwQXVLSi9TTlUwMGZ5S1RNOVpOaFZldVFaNGQvZW0vUXFTTU4ySjcxRVYweUN1WmVMVW5tMEY5SEFUVDVleHhlT0NLSG1TYzNRYStzbUVNNDdYYU8zcjdrdjd2NWlpUVJzb0xydlJydElzaG50U0VFSE9sUE9YRS8xOUtEcjQ5eGhyeTlpQlB0YUJ1d2tBdS9LbytLaEdIR3MzNFZ3VkVDWjY2Z0laRUZYUzl6bDdYc1dZVXViOTBPZlM0SXozVkxWMTgyNXYvanVVQUV2NHhaMVplaC93MkZtaFFMRHd5c2p1c244N3JkNHBKWHByak1GTmt4bWhNTlVGL2ludXJQOUcwU3JvUWlVcXR4T1JPbEw1M1gxMG14SG9LeVE3b1d0ZjBZck9CNm5MeFZRK20rcXNGdnhEUlQvL25OYVdTRWpMUzIxZFFEZmpiTWYyWEptYno1bDZ4WjZjUnN1bGRMWTBOSHpKU2FzMVdhQkZnc2oyN282eWZGKzM1cUFlMTBJNkVKczBncTF6dndUODd1M3RhaDIvaXVtL0FlQkVBSzFQNm1ucXN1WUtHRUFUbGJMdHRuK3lZUUdnbFA5VmozVVNHZ2NCNGpnYS9MMWZCMkRFR0pIQmMrdWZFSXptb1FvRHl4ckdvc3QwU295SFNXWjVncGVKVzNsYkZtNnY3bXRZMzFoYWN0Q1o4TkRQVkkvYUlwUFhBdU1ULytVNzRWS3U2UmVXMmRLaFBuanlNd0MvZG9DdXAyVHVBd1drTDkzb0hzZEpPaFM0M1g1OG1wK2owamRBY09JZDVyS1N0ZzFneU01dDN5WVh3d0svODlnTmxEcnNzUVA2Q2s4SG9ZM1RWWXJOcmplQUI1RkNXdlZqUFZ4SGRGZE5FNzlra3JuQ2QrU2RRL0ZnWFFtMEZVTEhOY3l3cEpmZE9naEN0MnhCUFdSOU90OHZUbllFUjM2VFFFOXB0QXRzaWZxMzR5T1dPb1lDUkhPTUU2SWpBeDZzZEJtUmt5Wms3MWhxVENrSkxnc2hTOFEwRWMycEdmOUtQWVFFVXNxUUQvcFRqdW85TGZ1UVZsT1NPQXF1QTRUVWhVeUlKQWR0S3ZsS3ZTdzh5MG9JQVVWT3dDUnBFV2RYN2ZibXM4Z3I3MEJPTWZ4alh1Wm9jbWJXd0E3bUZ5MU4yU1VEOVYyKzlBbnk5R0I2ZFNjMmlQM0cwQ05jd0pjUWVyZTRkMzZBdzlFR2pZK0Q4eldUK093WDhrYlJlVEN3K2xnY2ZlTFBLdDdsTk9acUlKRnlWdkFld0RoWDJURStIYktPMzVUMFA1MVl5eDd0Um9VUFkrcGl5ZVhYS3M1c09FTGs4ejlId0tDMHE4cktIM1FwNE10KzZjcXdyak9naGVjTmU3ZjdIMjZwQkFnc2h5UFlId0xqVzlOdllldG9mS2xKSnZENmlRaFBnWDNwU04zbTFOTGNMTUxVMEV6ZVNGd2lWeHdpVmNRSWN1V2JMNGJiMXI5cHNxT3BuYVR2OC9TN0p1cjBkY1JqbDNRY1NRNm5nOElocGQwZjFkbjRYUlgwT2VTb2NWd3dOSUtscHlFVERGOWJoRlQ1L21HaHh4M0ZuVUtHNUcvY3BtY0tMNm41TmtjMUQ2Q0JaZFpRbEJtZ09VRk5samVFTmxtL0V1TWNaTUE0Rm1LOHdCZHo4cnliVlJkVll3YW1UMXRabkxlekhOQ3ozU05TZC0tdGRuWTV5SERhVXgwWU92NVVFdXExQT09--d6cc2f6952f7d89491fa1dcc9c340037ca933dcb; _dd_s=rum=0&expire=1741699758978; banners_ui_state=PENDING';  
    // Scraper les ventes Vinted pour chaque ID de Dealabs
    for (const id of dealabsIds) {
      console.log(`Scraping Vinted sales for Dealabs ID: ${id}...`);

      const vintedUrl = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${id}`;
      const sales = await vinted.scrape(vintedUrl, userAgent, cookie);

      if (!sales || sales.length === 0) {
        console.log(`No Vinted sales found for Dealabs ID: ${id}`);
      } else {
        // Filtrer les ventes pour s'assurer que la marque est LEGO
        const legoSales = sales.filter(sale => sale.brand_title === 'LEGO');

        if (legoSales.length > 0) {
          // Sauvegarder les résultats de Vinted pour cet ID dans un fichier JSON
          const fileName = `vinted_sales_${id}.json`;
          fs.writeFileSync(fileName, JSON.stringify(legoSales, null, 2), 'utf-8');
          console.log(`Sales for Dealabs ID ${id} (brand: LEGO) saved to ${fileName}`);
        } else {
          console.log(`No LEGO sales found for Dealabs ID: ${id}`);
        }
      }
    }

    console.log('Done scraping all deals and Vinted sales.');
  } catch (e) {
    console.error('Error during scraping:', e);
  }
}

// URL à scraper depuis Dealabs 
const dealabsUrl = 'https://www.dealabs.com/groupe/lego';  
scrapeDealsAndVinted(dealabsUrl);
