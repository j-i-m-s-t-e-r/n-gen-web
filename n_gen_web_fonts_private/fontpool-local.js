/**
 * fontpool-local.js — LOCAL USE ONLY, DO NOT COMMIT
 *
 * Overrides the public FONT_POOLS (js/fontpool.js, free Google Fonts)
 * with the actual fonts extracted from the original n_Gen .cxt files —
 * 150 real fonts across 6 modules, deduplicated by content hash from the
 * original 244-file export.
 *
 * This file and the font files alongside it are commercial/licensed
 * typefaces from real foundries (Émigré, Berthold, Linotype, Bitstream,
 * and others). They are NOT to be committed to git, deployed to GitHub
 * Pages, or otherwise made public — see README-PRIVATE.md.
 *
 * To use: add these two tags to index.html, LOCALLY ONLY, after the
 * existing font <link> and after js/fontpool.js:
 *   <link rel="stylesheet" href="fonts-private/fonts-local.css">
 *   <script src="fonts-private/fontpool-local.js"></script>
 */

(function () {
  const LOCAL_POOLS = {
  "techno": [
    "2021_CARBON_ALP30",
    "2021_CARBON_KAT30",
    "2051_PLASTIC_ALP51",
    "2051_PLASTIC_KAT53",
    "2091_STEEL_ALP51",
    "25_Helvetica_UltraLight",
    "35_Helvetica_Thin",
    "55_Helvetica_Roman",
    "65_Helvetica_Medium",
    "66_Helvetica_MediumItalic",
    "AG_Old_Face_BoldOutline",
    "ASTEROIDS",
    "AddWASP",
    "Base9",
    "BubbledotICGCoarseNegative",
    "Bug_Regular",
    "Chibacity_Outline",
    "CitizenLight",
    "Code_3of9",
    "DicotMedium",
    "DigitalReadOut",
    "Eurostile_Condensed",
    "GASBOOK2_K0307",
    "HandelGothic_BT",
    "HelveticaNeue_MediumExt",
    "HelveticaNeue_UltraLigExt",
    "ITACHOKO_ALPHABET",
    "Isonorm3098_Italic",
    "LCDK",
    "MinitelLight",
    "OCRA",
    "Oracle",
    "Roundstyle_Regular",
    "RussellSquare_Oblique",
    "ScreenMatrix_Grid",
    "TGR_3_0_E_Italic",
    "TGR_3_0_J_Italic",
    "flourescent",
    "helvetica",
    "ocrb",
    "space"
  ],
  "cal": [
    "55_Helvetica_Roman",
    "AmoebiaRain",
    "AmplifierLight",
    "ArbitraryBold",
    "ArbitraryRegular",
    "Base12Serif",
    "Bernhard_Modern_Roman",
    "BlurLight",
    "DeadHistoryRom",
    "Device",
    "EngrvrsOldEng_BT",
    "EngrvrsOldEng_Bd_BT",
    "Entropy",
    "EscalidoGothico",
    "EscalidoStreak",
    "Eviscerate",
    "ExocetLight",
    "Fette_Fraktur",
    "Fraktur_BT",
    "GothicBlond_Husky",
    "OCRB",
    "Oracle",
    "Prestige_Elite",
    "TemplateGothicBold",
    "Trixie_Cameo",
    "Trixie_Text",
    "Undo",
    "Undo36",
    "esso",
    "maldita",
    "tablhoide",
    "uncletypewriter"
  ],
  "ftool": [
    "AbileneFLF",
    "Alphabits",
    "Arnold_Boecklin",
    "BellBottom",
    "Block_Out",
    "CandiDRo1",
    "CandiDSh1",
    "Cubicle",
    "Exotica_Edelweiss",
    "Exotica_Jasumin",
    "FUNK_Bold",
    "Framework_Regular",
    "Giddy_Alphabet",
    "Hachipochi_EightAl",
    "Heads_of_the_Household",
    "Inkblob",
    "Ironwood",
    "JUICYFRUITS2_0E_Regular",
    "JUICYFRUITS_2_0J_Regular",
    "KISEKAE",
    "LPLset",
    "MatrixScriptBold",
    "MatrixScriptRegular",
    "MoonbaseAlpha",
    "MotterFeminaSH",
    "ONIKU_KATA",
    "Orbit_B_BT",
    "PetSounds",
    "Pixie_Five",
    "PreludeScriptFLF_Bold",
    "Puffy_Dreamland",
    "ROTORcap_Symbols",
    "ROTORkeff",
    "Rope_MF",
    "SuburbanBold",
    "SuburbanLight",
    "TOY_3D",
    "Thornforms",
    "Thunderbird",
    "animals",
    "caramel_font",
    "mog_mix",
    "osyaberi_font"
  ],
  "mod": [
    "45_Helvetica_Light",
    "55_Helvetica_Roman",
    "AachenBold",
    "Akzidenz_Grotesk_BE_Bold",
    "Akzidenz_Grotesk_BE_BoldCn",
    "Akzidenz_Grotesk_BE_Light",
    "Akzidenz_Grotesk_BE_XBdCn",
    "B_Aachen_Bold",
    "B_Helvetica_Bold",
    "B_Lubalin_Graph_Demi",
    "Bauhaus_Heavy",
    "Bauhaus_Light",
    "C_Univers_57_Condensed",
    "Eurostile_BoldExtendedTwo",
    "GridLock",
    "HelveExtCompressed",
    "HelveticaInserat_Roman"
  ],
  "urb": [
    "AG_Old_Face_BoldOutline",
    "Akzidenz_Grotesk_BE_Md",
    "DINMittelschrift",
    "HelveUltCompressed",
    "HelveticaNeue_LightExt",
    "HelveticaNeue_ThinExt",
    "TradeGothic_BoldCondTwenty"
  ],
  "generic": [
    "35_Helvetica_Thin",
    "45_Helvetica_Light",
    "65_Helvetica_Medium",
    "Akzidenz_Grotesk_BE",
    "DINEngschrift",
    "Eurostile_ExtendedTwo",
    "HelveticaNeue_LightExt",
    "OCRB",
    "TradeGothic_BoldCondTwenty",
    "Univers_55"
  ]
};

  // Overwrite the module-level FONT_POOLS object in place (const, but the
  // object itself is mutable) so engine.js's randomFont() picks these up
  // automatically with no other code changes needed.
  Object.keys(LOCAL_POOLS).forEach((mod) => {
    FONT_POOLS[mod] = LOCAL_POOLS[mod].map((name) => `"${name}"`);
  });

  console.log('[fontpool-local] Loaded', Object.values(LOCAL_POOLS).flat().length, 'real fonts across', Object.keys(LOCAL_POOLS).length, 'modules — local override active.');
})();
