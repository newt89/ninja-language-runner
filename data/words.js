// ═══════════════════════════════════════════════════════
//  NINJA LANGUAGE RUNNER — Word Database
//  All 7 languages with categories, difficulty, audio keys
// ═══════════════════════════════════════════════════════

const WORD_DB = {

  spanish: {
    name: "Español", flag: "🇪🇸", dir: "ltr",
    levels: {
      1: [
        { en:"apple",    tr:"manzana",   cat:"noun",  audio:"es-apple" },
        { en:"house",    tr:"casa",      cat:"noun",  audio:"es-house" },
        { en:"water",    tr:"agua",      cat:"noun",  audio:"es-water" },
        { en:"fire",     tr:"fuego",     cat:"noun",  audio:"es-fire" },
        { en:"dog",      tr:"perro",     cat:"noun",  audio:"es-dog" },
        { en:"cat",      tr:"gato",      cat:"noun",  audio:"es-cat" },
        { en:"book",     tr:"libro",     cat:"noun",  audio:"es-book" },
        { en:"sun",      tr:"sol",       cat:"noun",  audio:"es-sun" },
        { en:"moon",     tr:"luna",      cat:"noun",  audio:"es-moon" },
        { en:"tree",     tr:"árbol",     cat:"noun",  audio:"es-tree" },
        { en:"bread",    tr:"pan",       cat:"noun",  audio:"es-bread" },
        { en:"city",     tr:"ciudad",    cat:"noun",  audio:"es-city" },
        { en:"man",      tr:"hombre",    cat:"noun",  audio:"es-man" },
        { en:"woman",    tr:"mujer",     cat:"noun",  audio:"es-woman" },
        { en:"child",    tr:"niño",      cat:"noun",  audio:"es-child" },
      ],
      2: [
        { en:"to eat",   tr:"comer",     cat:"verb",  audio:"es-eat" },
        { en:"to run",   tr:"correr",    cat:"verb",  audio:"es-run" },
        { en:"to see",   tr:"ver",       cat:"verb",  audio:"es-see" },
        { en:"to go",    tr:"ir",        cat:"verb",  audio:"es-go" },
        { en:"to speak", tr:"hablar",    cat:"verb",  audio:"es-speak" },
        { en:"to want",  tr:"querer",    cat:"verb",  audio:"es-want" },
        { en:"to have",  tr:"tener",     cat:"verb",  audio:"es-have" },
        { en:"to be",    tr:"ser/estar", cat:"verb",  audio:"es-be" },
        { en:"to know",  tr:"saber",     cat:"verb",  audio:"es-know" },
        { en:"to come",  tr:"venir",     cat:"verb",  audio:"es-come" },
      ],
      3: [
        { en:"big",      tr:"grande",    cat:"adj",   audio:"es-big" },
        { en:"small",    tr:"pequeño",   cat:"adj",   audio:"es-small" },
        { en:"fast",     tr:"rápido",    cat:"adj",   audio:"es-fast" },
        { en:"slow",     tr:"lento",     cat:"adj",   audio:"es-slow" },
        { en:"good",     tr:"bueno",     cat:"adj",   audio:"es-good" },
        { en:"bad",      tr:"malo",      cat:"adj",   audio:"es-bad" },
        { en:"new",      tr:"nuevo",     cat:"adj",   audio:"es-new" },
        { en:"old",      tr:"viejo",     cat:"adj",   audio:"es-old" },
        { en:"happy",    tr:"feliz",     cat:"adj",   audio:"es-happy" },
        { en:"sad",      tr:"triste",    cat:"adj",   audio:"es-sad" },
      ],
      4: [
        { en:"freedom",  tr:"libertad",  cat:"abstract", audio:"es-freedom" },
        { en:"truth",    tr:"verdad",    cat:"abstract", audio:"es-truth" },
        { en:"love",     tr:"amor",      cat:"abstract", audio:"es-love" },
        { en:"time",     tr:"tiempo",    cat:"abstract", audio:"es-time" },
        { en:"world",    tr:"mundo",     cat:"abstract", audio:"es-world" },
        { en:"power",    tr:"poder",     cat:"abstract", audio:"es-power" },
        { en:"mind",     tr:"mente",     cat:"abstract", audio:"es-mind" },
        { en:"life",     tr:"vida",      cat:"abstract", audio:"es-life" },
      ],
    },
    sentences: [
      { en:"I eat an apple",          tr:"Yo como una manzana" },
      { en:"The house is big",        tr:"La casa es grande" },
      { en:"She runs fast",           tr:"Ella corre rápido" },
      { en:"We speak Spanish",        tr:"Nosotros hablamos español" },
      { en:"The dog is happy",        tr:"El perro está feliz" },
    ]
  },

  arabic: {
    name: "العربية", flag: "🇸🇦", dir: "rtl",
    levels: {
      1: [
        { en:"apple",   tr:"تفاحة",    cat:"noun", audio:"ar-apple" },
        { en:"house",   tr:"بيت",      cat:"noun", audio:"ar-house" },
        { en:"water",   tr:"ماء",      cat:"noun", audio:"ar-water" },
        { en:"fire",    tr:"نار",      cat:"noun", audio:"ar-fire" },
        { en:"dog",     tr:"كلب",      cat:"noun", audio:"ar-dog" },
        { en:"cat",     tr:"قطة",      cat:"noun", audio:"ar-cat" },
        { en:"book",    tr:"كتاب",     cat:"noun", audio:"ar-book" },
        { en:"sun",     tr:"شمس",      cat:"noun", audio:"ar-sun" },
        { en:"moon",    tr:"قمر",      cat:"noun", audio:"ar-moon" },
        { en:"tree",    tr:"شجرة",     cat:"noun", audio:"ar-tree" },
        { en:"bread",   tr:"خبز",      cat:"noun", audio:"ar-bread" },
        { en:"man",     tr:"رجل",      cat:"noun", audio:"ar-man" },
        { en:"woman",   tr:"امرأة",    cat:"noun", audio:"ar-woman" },
        { en:"school",  tr:"مدرسة",    cat:"noun", audio:"ar-school" },
        { en:"city",    tr:"مدينة",    cat:"noun", audio:"ar-city" },
      ],
      2: [
        { en:"to eat",  tr:"يأكل",     cat:"verb", audio:"ar-eat" },
        { en:"to run",  tr:"يركض",     cat:"verb", audio:"ar-run" },
        { en:"to see",  tr:"يرى",      cat:"verb", audio:"ar-see" },
        { en:"to go",   tr:"يذهب",     cat:"verb", audio:"ar-go" },
        { en:"to speak",tr:"يتكلم",    cat:"verb", audio:"ar-speak" },
        { en:"to know", tr:"يعرف",     cat:"verb", audio:"ar-know" },
        { en:"to love", tr:"يحب",      cat:"verb", audio:"ar-love" },
        { en:"to write",tr:"يكتب",     cat:"verb", audio:"ar-write" },
      ],
      3: [
        { en:"big",     tr:"كبير",     cat:"adj",  audio:"ar-big" },
        { en:"small",   tr:"صغير",     cat:"adj",  audio:"ar-small" },
        { en:"good",    tr:"جيد",      cat:"adj",  audio:"ar-good" },
        { en:"beautiful",tr:"جميل",    cat:"adj",  audio:"ar-beautiful" },
        { en:"new",     tr:"جديد",     cat:"adj",  audio:"ar-new" },
        { en:"old",     tr:"قديم",     cat:"adj",  audio:"ar-old" },
      ],
    },
    sentences: [
      { en:"I go to school",          tr:"أنا أذهب إلى المدرسة" },
      { en:"The book is new",         tr:"الكتاب جديد" },
      { en:"She drinks water",        tr:"هي تشرب الماء" },
    ]
  },

  russian: {
    name: "Русский", flag: "🇷🇺", dir: "ltr",
    levels: {
      1: [
        { en:"apple",   tr:"яблоко",   cat:"noun", audio:"ru-apple" },
        { en:"house",   tr:"дом",      cat:"noun", audio:"ru-house" },
        { en:"water",   tr:"вода",     cat:"noun", audio:"ru-water" },
        { en:"fire",    tr:"огонь",    cat:"noun", audio:"ru-fire" },
        { en:"dog",     tr:"собака",   cat:"noun", audio:"ru-dog" },
        { en:"cat",     tr:"кошка",    cat:"noun", audio:"ru-cat" },
        { en:"book",    tr:"книга",    cat:"noun", audio:"ru-book" },
        { en:"sun",     tr:"солнце",   cat:"noun", audio:"ru-sun" },
        { en:"moon",    tr:"луна",     cat:"noun", audio:"ru-moon" },
        { en:"bread",   tr:"хлеб",     cat:"noun", audio:"ru-bread" },
        { en:"city",    tr:"город",    cat:"noun", audio:"ru-city" },
        { en:"man",     tr:"мужчина",  cat:"noun", audio:"ru-man" },
        { en:"woman",   tr:"женщина",  cat:"noun", audio:"ru-woman" },
        { en:"child",   tr:"ребёнок",  cat:"noun", audio:"ru-child" },
        { en:"friend",  tr:"друг",     cat:"noun", audio:"ru-friend" },
      ],
      2: [
        { en:"to eat",  tr:"есть",     cat:"verb", audio:"ru-eat" },
        { en:"to run",  tr:"бежать",   cat:"verb", audio:"ru-run" },
        { en:"to see",  tr:"видеть",   cat:"verb", audio:"ru-see" },
        { en:"to go",   tr:"идти",     cat:"verb", audio:"ru-go" },
        { en:"to speak",tr:"говорить", cat:"verb", audio:"ru-speak" },
        { en:"to know", tr:"знать",    cat:"verb", audio:"ru-know" },
        { en:"to love", tr:"любить",   cat:"verb", audio:"ru-love" },
        { en:"to read", tr:"читать",   cat:"verb", audio:"ru-read" },
      ],
      3: [
        { en:"big",     tr:"большой",  cat:"adj",  audio:"ru-big" },
        { en:"small",   tr:"маленький",cat:"adj",  audio:"ru-small" },
        { en:"good",    tr:"хороший",  cat:"adj",  audio:"ru-good" },
        { en:"new",     tr:"новый",    cat:"adj",  audio:"ru-new" },
        { en:"fast",    tr:"быстрый",  cat:"adj",  audio:"ru-fast" },
        { en:"beautiful",tr:"красивый",cat:"adj",  audio:"ru-beautiful" },
      ],
    },
    sentences: [
      { en:"I read a book",           tr:"Я читаю книгу" },
      { en:"The city is big",         tr:"Город большой" },
      { en:"She loves her friend",    tr:"Она любит своего друга" },
    ]
  },

  mandarin: {
    name: "普通话", flag: "🇨🇳", dir: "ltr",
    levels: {
      1: [
        { en:"apple",   tr:"苹果",     cat:"noun", audio:"zh-apple",  pinyin:"píngguǒ" },
        { en:"house",   tr:"房子",     cat:"noun", audio:"zh-house",  pinyin:"fángzi" },
        { en:"water",   tr:"水",       cat:"noun", audio:"zh-water",  pinyin:"shuǐ" },
        { en:"fire",    tr:"火",       cat:"noun", audio:"zh-fire",   pinyin:"huǒ" },
        { en:"dog",     tr:"狗",       cat:"noun", audio:"zh-dog",    pinyin:"gǒu" },
        { en:"cat",     tr:"猫",       cat:"noun", audio:"zh-cat",    pinyin:"māo" },
        { en:"book",    tr:"书",       cat:"noun", audio:"zh-book",   pinyin:"shū" },
        { en:"sun",     tr:"太阳",     cat:"noun", audio:"zh-sun",    pinyin:"tàiyáng" },
        { en:"moon",    tr:"月亮",     cat:"noun", audio:"zh-moon",   pinyin:"yuèliàng" },
        { en:"tree",    tr:"树",       cat:"noun", audio:"zh-tree",   pinyin:"shù" },
        { en:"bread",   tr:"面包",     cat:"noun", audio:"zh-bread",  pinyin:"miànbāo" },
        { en:"man",     tr:"男人",     cat:"noun", audio:"zh-man",    pinyin:"nánrén" },
        { en:"woman",   tr:"女人",     cat:"noun", audio:"zh-woman",  pinyin:"nǚrén" },
        { en:"child",   tr:"孩子",     cat:"noun", audio:"zh-child",  pinyin:"háizi" },
        { en:"friend",  tr:"朋友",     cat:"noun", audio:"zh-friend", pinyin:"péngyǒu" },
      ],
      2: [
        { en:"to eat",  tr:"吃",       cat:"verb", audio:"zh-eat",    pinyin:"chī" },
        { en:"to run",  tr:"跑",       cat:"verb", audio:"zh-run",    pinyin:"pǎo" },
        { en:"to see",  tr:"看",       cat:"verb", audio:"zh-see",    pinyin:"kàn" },
        { en:"to go",   tr:"去",       cat:"verb", audio:"zh-go",     pinyin:"qù" },
        { en:"to speak",tr:"说",       cat:"verb", audio:"zh-speak",  pinyin:"shuō" },
        { en:"to know", tr:"知道",     cat:"verb", audio:"zh-know",   pinyin:"zhīdào" },
        { en:"to love", tr:"爱",       cat:"verb", audio:"zh-love",   pinyin:"ài" },
        { en:"to read", tr:"读",       cat:"verb", audio:"zh-read",   pinyin:"dú" },
      ],
      3: [
        { en:"big",     tr:"大",       cat:"adj",  audio:"zh-big",    pinyin:"dà" },
        { en:"small",   tr:"小",       cat:"adj",  audio:"zh-small",  pinyin:"xiǎo" },
        { en:"good",    tr:"好",       cat:"adj",  audio:"zh-good",   pinyin:"hǎo" },
        { en:"beautiful",tr:"美丽",    cat:"adj",  audio:"zh-beautiful",pinyin:"měilì" },
        { en:"fast",    tr:"快",       cat:"adj",  audio:"zh-fast",   pinyin:"kuài" },
        { en:"new",     tr:"新",       cat:"adj",  audio:"zh-new",    pinyin:"xīn" },
      ],
    },
    sentences: [
      { en:"I eat an apple",          tr:"我吃苹果",    pinyin:"wǒ chī píngguǒ" },
      { en:"The house is big",        tr:"房子很大",    pinyin:"fángzi hěn dà" },
      { en:"She reads a book",        tr:"她读书",      pinyin:"tā dú shū" },
    ]
  },

  german: {
    name: "Deutsch", flag: "🇩🇪", dir: "ltr",
    levels: {
      1: [
        { en:"apple",   tr:"Apfel",    cat:"noun", audio:"de-apple" },
        { en:"house",   tr:"Haus",     cat:"noun", audio:"de-house" },
        { en:"water",   tr:"Wasser",   cat:"noun", audio:"de-water" },
        { en:"fire",    tr:"Feuer",    cat:"noun", audio:"de-fire" },
        { en:"dog",     tr:"Hund",     cat:"noun", audio:"de-dog" },
        { en:"cat",     tr:"Katze",    cat:"noun", audio:"de-cat" },
        { en:"book",    tr:"Buch",     cat:"noun", audio:"de-book" },
        { en:"sun",     tr:"Sonne",    cat:"noun", audio:"de-sun" },
        { en:"moon",    tr:"Mond",     cat:"noun", audio:"de-moon" },
        { en:"tree",    tr:"Baum",     cat:"noun", audio:"de-tree" },
        { en:"bread",   tr:"Brot",     cat:"noun", audio:"de-bread" },
        { en:"city",    tr:"Stadt",    cat:"noun", audio:"de-city" },
        { en:"man",     tr:"Mann",     cat:"noun", audio:"de-man" },
        { en:"woman",   tr:"Frau",     cat:"noun", audio:"de-woman" },
        { en:"child",   tr:"Kind",     cat:"noun", audio:"de-child" },
      ],
      2: [
        { en:"to eat",  tr:"essen",    cat:"verb", audio:"de-eat" },
        { en:"to run",  tr:"laufen",   cat:"verb", audio:"de-run" },
        { en:"to see",  tr:"sehen",    cat:"verb", audio:"de-see" },
        { en:"to go",   tr:"gehen",    cat:"verb", audio:"de-go" },
        { en:"to speak",tr:"sprechen", cat:"verb", audio:"de-speak" },
        { en:"to know", tr:"wissen",   cat:"verb", audio:"de-know" },
        { en:"to love", tr:"lieben",   cat:"verb", audio:"de-love" },
        { en:"to read", tr:"lesen",    cat:"verb", audio:"de-read" },
      ],
      3: [
        { en:"big",     tr:"groß",     cat:"adj",  audio:"de-big" },
        { en:"small",   tr:"klein",    cat:"adj",  audio:"de-small" },
        { en:"good",    tr:"gut",      cat:"adj",  audio:"de-good" },
        { en:"new",     tr:"neu",      cat:"adj",  audio:"de-new" },
        { en:"fast",    tr:"schnell",  cat:"adj",  audio:"de-fast" },
        { en:"beautiful",tr:"schön",   cat:"adj",  audio:"de-beautiful" },
      ],
    },
    sentences: [
      { en:"I eat bread",             tr:"Ich esse Brot" },
      { en:"The house is big",        tr:"Das Haus ist groß" },
      { en:"She reads a book",        tr:"Sie liest ein Buch" },
    ]
  },

  sanskrit: {
    name: "संस्कृतम्", flag: "🇮🇳", dir: "ltr",
    levels: {
      1: [
        { en:"water",   tr:"जलम्",     cat:"noun", audio:"sa-water",  roman:"jalam" },
        { en:"fire",    tr:"अग्निः",   cat:"noun", audio:"sa-fire",   roman:"agniḥ" },
        { en:"sun",     tr:"सूर्यः",   cat:"noun", audio:"sa-sun",    roman:"sūryaḥ" },
        { en:"moon",    tr:"चन्द्रः",  cat:"noun", audio:"sa-moon",   roman:"candraḥ" },
        { en:"tree",    tr:"वृक्षः",   cat:"noun", audio:"sa-tree",   roman:"vṛkṣaḥ" },
        { en:"house",   tr:"गृहम्",    cat:"noun", audio:"sa-house",  roman:"gṛham" },
        { en:"man",     tr:"पुरुषः",   cat:"noun", audio:"sa-man",    roman:"puruṣaḥ" },
        { en:"woman",   tr:"स्त्री",   cat:"noun", audio:"sa-woman",  roman:"strī" },
        { en:"child",   tr:"बालः",     cat:"noun", audio:"sa-child",  roman:"bālaḥ" },
        { en:"god",     tr:"देवः",     cat:"noun", audio:"sa-god",    roman:"devaḥ" },
        { en:"earth",   tr:"भूमिः",    cat:"noun", audio:"sa-earth",  roman:"bhūmiḥ" },
        { en:"sky",     tr:"आकाशः",    cat:"noun", audio:"sa-sky",    roman:"ākāśaḥ" },
      ],
      2: [
        { en:"to go",   tr:"गच्छति",   cat:"verb", audio:"sa-go",     roman:"gacchati" },
        { en:"to eat",  tr:"खादति",    cat:"verb", audio:"sa-eat",    roman:"khādati" },
        { en:"to see",  tr:"पश्यति",   cat:"verb", audio:"sa-see",    roman:"paśyati" },
        { en:"to speak",tr:"वदति",     cat:"verb", audio:"sa-speak",  roman:"vadati" },
        { en:"to know", tr:"जानाति",   cat:"verb", audio:"sa-know",   roman:"jānāti" },
        { en:"to give", tr:"ददाति",    cat:"verb", audio:"sa-give",   roman:"dadāti" },
      ],
      3: [
        { en:"good",    tr:"शुभः",     cat:"adj",  audio:"sa-good",   roman:"śubhaḥ" },
        { en:"big",     tr:"महान्",    cat:"adj",  audio:"sa-big",    roman:"mahān" },
        { en:"beautiful",tr:"सुन्दरः", cat:"adj",  audio:"sa-beautiful",roman:"sundaraḥ" },
        { en:"new",     tr:"नवः",      cat:"adj",  audio:"sa-new",    roman:"navaḥ" },
      ],
    },
    sentences: [
      { en:"The child goes",          tr:"बालः गच्छति",   roman:"bālaḥ gacchati" },
      { en:"Water is good",           tr:"जलं शुभम्",     roman:"jalaṃ śubham" },
    ]
  },

};

// Language code map for Web Speech API
const LANG_CODES = {
  spanish:  "es-ES",
  arabic:   "ar-SA",
  russian:  "ru-RU",
  mandarin: "zh-CN",
  german:   "de-DE",
  sanskrit: "hi-IN", // closest available
};

// Get all words for a language flattened
function getAllWords(lang) {
  const db = WORD_DB[lang];
  if (!db) return [];
  return Object.values(db.levels).flat();
}

// Get words by difficulty tier
function getWordsByTier(lang, tier) {
  const db = WORD_DB[lang];
  if (!db) return [];
  return db.levels[tier] || [];
}
