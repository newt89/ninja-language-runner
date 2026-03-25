// ═══════════════════════════════════════
//  NLR — Word Database (all 7 languages)
// ═══════════════════════════════════════
const LANG_CODES = {
  spanish:"es-ES", arabic:"ar-SA", russian:"ru-RU",
  mandarin:"zh-CN", german:"de-DE", sanskrit:"hi-IN"
};

const WORD_DB = {
  spanish:{
    name:"Español",flag:"🇪🇸",dir:"ltr",
    levels:{
      1:[
        {en:"apple",tr:"manzana",cat:"noun"},{en:"house",tr:"casa",cat:"noun"},
        {en:"water",tr:"agua",cat:"noun"},{en:"fire",tr:"fuego",cat:"noun"},
        {en:"dog",tr:"perro",cat:"noun"},{en:"cat",tr:"gato",cat:"noun"},
        {en:"book",tr:"libro",cat:"noun"},{en:"sun",tr:"sol",cat:"noun"},
        {en:"moon",tr:"luna",cat:"noun"},{en:"tree",tr:"árbol",cat:"noun"},
        {en:"bread",tr:"pan",cat:"noun"},{en:"city",tr:"ciudad",cat:"noun"},
        {en:"man",tr:"hombre",cat:"noun"},{en:"woman",tr:"mujer",cat:"noun"},
        {en:"child",tr:"niño",cat:"noun"},{en:"friend",tr:"amigo",cat:"noun"},
      ],
      2:[
        {en:"to eat",tr:"comer",cat:"verb"},{en:"to run",tr:"correr",cat:"verb"},
        {en:"to see",tr:"ver",cat:"verb"},{en:"to go",tr:"ir",cat:"verb"},
        {en:"to speak",tr:"hablar",cat:"verb"},{en:"to want",tr:"querer",cat:"verb"},
        {en:"to have",tr:"tener",cat:"verb"},{en:"to know",tr:"saber",cat:"verb"},
        {en:"to come",tr:"venir",cat:"verb"},{en:"to live",tr:"vivir",cat:"verb"},
      ],
      3:[
        {en:"big",tr:"grande",cat:"adj"},{en:"small",tr:"pequeño",cat:"adj"},
        {en:"fast",tr:"rápido",cat:"adj"},{en:"slow",tr:"lento",cat:"adj"},
        {en:"good",tr:"bueno",cat:"adj"},{en:"bad",tr:"malo",cat:"adj"},
        {en:"new",tr:"nuevo",cat:"adj"},{en:"old",tr:"viejo",cat:"adj"},
        {en:"happy",tr:"feliz",cat:"adj"},{en:"sad",tr:"triste",cat:"adj"},
      ],
      4:[
        {en:"freedom",tr:"libertad",cat:"abstract"},{en:"truth",tr:"verdad",cat:"abstract"},
        {en:"love",tr:"amor",cat:"abstract"},{en:"time",tr:"tiempo",cat:"abstract"},
        {en:"world",tr:"mundo",cat:"abstract"},{en:"power",tr:"poder",cat:"abstract"},
        {en:"mind",tr:"mente",cat:"abstract"},{en:"life",tr:"vida",cat:"abstract"},
      ]
    },
    sentences:[
      {en:"I eat an apple",tr:"Yo como una manzana"},
      {en:"The house is big",tr:"La casa es grande"},
      {en:"She runs fast",tr:"Ella corre rápido"},
      {en:"We speak Spanish",tr:"Nosotros hablamos español"},
      {en:"The dog is happy",tr:"El perro está feliz"},
      {en:"He has a book",tr:"Él tiene un libro"},
      {en:"They want water",tr:"Ellos quieren agua"},
    ]
  },
  mandarin:{
    name:"普通话",flag:"🇨🇳",dir:"ltr",
    levels:{
      1:[
        {en:"apple",   tr:"苹果",  cat:"noun",pinyin:"píngguǒ"},
        {en:"house",   tr:"房子",  cat:"noun",pinyin:"fángzi"},
        {en:"water",   tr:"水",    cat:"noun",pinyin:"shuǐ"},
        {en:"fire",    tr:"火",    cat:"noun",pinyin:"huǒ"},
        {en:"dog",     tr:"狗",    cat:"noun",pinyin:"gǒu"},
        {en:"cat",     tr:"猫",    cat:"noun",pinyin:"māo"},
        {en:"book",    tr:"书",    cat:"noun",pinyin:"shū"},
        {en:"sun",     tr:"太阳",  cat:"noun",pinyin:"tàiyáng"},
        {en:"moon",    tr:"月亮",  cat:"noun",pinyin:"yuèliàng"},
        {en:"tree",    tr:"树",    cat:"noun",pinyin:"shù"},
        {en:"bread",   tr:"面包",  cat:"noun",pinyin:"miànbāo"},
        {en:"man",     tr:"男人",  cat:"noun",pinyin:"nánrén"},
        {en:"woman",   tr:"女人",  cat:"noun",pinyin:"nǚrén"},
        {en:"child",   tr:"孩子",  cat:"noun",pinyin:"háizi"},
        {en:"friend",  tr:"朋友",  cat:"noun",pinyin:"péngyǒu"},
        {en:"school",  tr:"学校",  cat:"noun",pinyin:"xuéxiào"},
        {en:"mountain",tr:"山",    cat:"noun",pinyin:"shān"},
        {en:"river",   tr:"河",    cat:"noun",pinyin:"hé"},
        {en:"sky",     tr:"天空",  cat:"noun",pinyin:"tiānkōng"},
        {en:"city",    tr:"城市",  cat:"noun",pinyin:"chéngshì"},
      ],
      2:[
        {en:"to eat",  tr:"吃",    cat:"verb",pinyin:"chī"},
        {en:"to run",  tr:"跑",    cat:"verb",pinyin:"pǎo"},
        {en:"to see",  tr:"看",    cat:"verb",pinyin:"kàn"},
        {en:"to go",   tr:"去",    cat:"verb",pinyin:"qù"},
        {en:"to speak",tr:"说话",  cat:"verb",pinyin:"shuōhuà"},
        {en:"to know", tr:"知道",  cat:"verb",pinyin:"zhīdào"},
        {en:"to love", tr:"爱",    cat:"verb",pinyin:"ài"},
        {en:"to read", tr:"读",    cat:"verb",pinyin:"dú"},
        {en:"to write",tr:"写",    cat:"verb",pinyin:"xiě"},
        {en:"to come", tr:"来",    cat:"verb",pinyin:"lái"},
      ],
      3:[
        {en:"big",       tr:"大",    cat:"adj",pinyin:"dà"},
        {en:"small",     tr:"小",    cat:"adj",pinyin:"xiǎo"},
        {en:"good",      tr:"好",    cat:"adj",pinyin:"hǎo"},
        {en:"beautiful", tr:"美丽",  cat:"adj",pinyin:"měilì"},
        {en:"fast",      tr:"快",    cat:"adj",pinyin:"kuài"},
        {en:"new",       tr:"新",    cat:"adj",pinyin:"xīn"},
        {en:"old",       tr:"旧",    cat:"adj",pinyin:"jiù"},
        {en:"happy",     tr:"开心",  cat:"adj",pinyin:"kāixīn"},
      ],
      4:[
        {en:"freedom",tr:"自由",cat:"abstract",pinyin:"zìyóu"},
        {en:"truth",  tr:"真相",cat:"abstract",pinyin:"zhēnxiàng"},
        {en:"love",   tr:"爱情",cat:"abstract",pinyin:"àiqíng"},
        {en:"time",   tr:"时间",cat:"abstract",pinyin:"shíjiān"},
        {en:"world",  tr:"世界",cat:"abstract",pinyin:"shìjiè"},
        {en:"mind",   tr:"思想",cat:"abstract",pinyin:"sīxiǎng"},
      ]
    },
    sentences:[
      {en:"I eat an apple",    tr:"我吃苹果",       pinyin:"wǒ chī píngguǒ"},
      {en:"The house is big",  tr:"房子很大",       pinyin:"fángzi hěn dà"},
      {en:"She reads a book",  tr:"她读书",         pinyin:"tā dú shū"},
      {en:"I love you",        tr:"我爱你",         pinyin:"wǒ ài nǐ"},
      {en:"He goes to school", tr:"他去学校",       pinyin:"tā qù xuéxiào"},
    ]
  },
  arabic:{
    name:"العربية",flag:"🇸🇦",dir:"rtl",
    levels:{
      1:[
        {en:"apple",  tr:"تفاحة",  cat:"noun"},{en:"house",tr:"بيت",   cat:"noun"},
        {en:"water",  tr:"ماء",    cat:"noun"},{en:"fire", tr:"نار",   cat:"noun"},
        {en:"dog",    tr:"كلب",    cat:"noun"},{en:"cat",  tr:"قطة",   cat:"noun"},
        {en:"book",   tr:"كتاب",   cat:"noun"},{en:"sun",  tr:"شمس",   cat:"noun"},
        {en:"moon",   tr:"قمر",    cat:"noun"},{en:"tree", tr:"شجرة",  cat:"noun"},
        {en:"bread",  tr:"خبز",    cat:"noun"},{en:"man",  tr:"رجل",   cat:"noun"},
        {en:"woman",  tr:"امرأة",  cat:"noun"},{en:"school",tr:"مدرسة",cat:"noun"},
        {en:"city",   tr:"مدينة",  cat:"noun"},
      ],
      2:[
        {en:"to eat", tr:"يأكل",  cat:"verb"},{en:"to run",tr:"يركض",  cat:"verb"},
        {en:"to see", tr:"يرى",   cat:"verb"},{en:"to go", tr:"يذهب",  cat:"verb"},
        {en:"to speak",tr:"يتكلم",cat:"verb"},{en:"to know",tr:"يعرف", cat:"verb"},
        {en:"to love",tr:"يحب",   cat:"verb"},{en:"to write",tr:"يكتب",cat:"verb"},
      ],
      3:[
        {en:"big",    tr:"كبير",  cat:"adj"},{en:"small",tr:"صغير", cat:"adj"},
        {en:"good",   tr:"جيد",   cat:"adj"},{en:"beautiful",tr:"جميل",cat:"adj"},
        {en:"new",    tr:"جديد",  cat:"adj"},{en:"old",  tr:"قديم", cat:"adj"},
      ]
    },
    sentences:[
      {en:"I go to school",   tr:"أنا أذهب إلى المدرسة"},
      {en:"The book is new",  tr:"الكتاب جديد"},
      {en:"She drinks water", tr:"هي تشرب الماء"},
    ]
  },
  russian:{
    name:"Русский",flag:"🇷🇺",dir:"ltr",
    levels:{
      1:[
        {en:"apple",  tr:"яблоко",  cat:"noun"},{en:"house",tr:"дом",      cat:"noun"},
        {en:"water",  tr:"вода",    cat:"noun"},{en:"fire", tr:"огонь",    cat:"noun"},
        {en:"dog",    tr:"собака",  cat:"noun"},{en:"cat",  tr:"кошка",    cat:"noun"},
        {en:"book",   tr:"книга",   cat:"noun"},{en:"sun",  tr:"солнце",   cat:"noun"},
        {en:"moon",   tr:"луна",    cat:"noun"},{en:"bread",tr:"хлеб",     cat:"noun"},
        {en:"city",   tr:"город",   cat:"noun"},{en:"man",  tr:"мужчина",  cat:"noun"},
        {en:"woman",  tr:"женщина", cat:"noun"},{en:"child",tr:"ребёнок",  cat:"noun"},
        {en:"friend", tr:"друг",    cat:"noun"},
      ],
      2:[
        {en:"to eat", tr:"есть",    cat:"verb"},{en:"to run",tr:"бежать",  cat:"verb"},
        {en:"to see", tr:"видеть",  cat:"verb"},{en:"to go", tr:"идти",    cat:"verb"},
        {en:"to speak",tr:"говорить",cat:"verb"},{en:"to know",tr:"знать", cat:"verb"},
        {en:"to love",tr:"любить",  cat:"verb"},{en:"to read",tr:"читать", cat:"verb"},
      ],
      3:[
        {en:"big",    tr:"большой",   cat:"adj"},{en:"small",tr:"маленький",cat:"adj"},
        {en:"good",   tr:"хороший",   cat:"adj"},{en:"new",  tr:"новый",    cat:"adj"},
        {en:"fast",   tr:"быстрый",   cat:"adj"},{en:"beautiful",tr:"красивый",cat:"adj"},
      ]
    },
    sentences:[
      {en:"I read a book",       tr:"Я читаю книгу"},
      {en:"The city is big",     tr:"Город большой"},
      {en:"She loves her friend",tr:"Она любит своего друга"},
    ]
  },
  german:{
    name:"Deutsch",flag:"🇩🇪",dir:"ltr",
    levels:{
      1:[
        {en:"apple",  tr:"Apfel",   cat:"noun"},{en:"house",tr:"Haus",    cat:"noun"},
        {en:"water",  tr:"Wasser",  cat:"noun"},{en:"fire", tr:"Feuer",   cat:"noun"},
        {en:"dog",    tr:"Hund",    cat:"noun"},{en:"cat",  tr:"Katze",   cat:"noun"},
        {en:"book",   tr:"Buch",    cat:"noun"},{en:"sun",  tr:"Sonne",   cat:"noun"},
        {en:"moon",   tr:"Mond",    cat:"noun"},{en:"tree", tr:"Baum",    cat:"noun"},
        {en:"bread",  tr:"Brot",    cat:"noun"},{en:"city", tr:"Stadt",   cat:"noun"},
        {en:"man",    tr:"Mann",    cat:"noun"},{en:"woman",tr:"Frau",    cat:"noun"},
        {en:"child",  tr:"Kind",    cat:"noun"},
      ],
      2:[
        {en:"to eat", tr:"essen",   cat:"verb"},{en:"to run",tr:"laufen",  cat:"verb"},
        {en:"to see", tr:"sehen",   cat:"verb"},{en:"to go", tr:"gehen",   cat:"verb"},
        {en:"to speak",tr:"sprechen",cat:"verb"},{en:"to know",tr:"wissen",cat:"verb"},
        {en:"to love",tr:"lieben",  cat:"verb"},{en:"to read",tr:"lesen",  cat:"verb"},
      ],
      3:[
        {en:"big",    tr:"groß",    cat:"adj"},{en:"small",tr:"klein",   cat:"adj"},
        {en:"good",   tr:"gut",     cat:"adj"},{en:"new",  tr:"neu",     cat:"adj"},
        {en:"fast",   tr:"schnell", cat:"adj"},{en:"beautiful",tr:"schön",cat:"adj"},
      ]
    },
    sentences:[
      {en:"I eat bread",       tr:"Ich esse Brot"},
      {en:"The house is big",  tr:"Das Haus ist groß"},
      {en:"She reads a book",  tr:"Sie liest ein Buch"},
    ]
  },
  sanskrit:{
    name:"संस्कृतम्",flag:"🇮🇳",dir:"ltr",
    levels:{
      1:[
        {en:"water",   tr:"जलम्",    cat:"noun",roman:"jalam"},
        {en:"fire",    tr:"अग्निः",  cat:"noun",roman:"agniḥ"},
        {en:"sun",     tr:"सूर्यः",  cat:"noun",roman:"sūryaḥ"},
        {en:"moon",    tr:"चन्द्रः", cat:"noun",roman:"candraḥ"},
        {en:"tree",    tr:"वृक्षः",  cat:"noun",roman:"vṛkṣaḥ"},
        {en:"house",   tr:"गृहम्",   cat:"noun",roman:"gṛham"},
        {en:"man",     tr:"पुरुषः",  cat:"noun",roman:"puruṣaḥ"},
        {en:"woman",   tr:"स्त्री",  cat:"noun",roman:"strī"},
        {en:"god",     tr:"देवः",    cat:"noun",roman:"devaḥ"},
        {en:"earth",   tr:"भूमिः",   cat:"noun",roman:"bhūmiḥ"},
        {en:"sky",     tr:"आकाशः",   cat:"noun",roman:"ākāśaḥ"},
        {en:"truth",   tr:"सत्यम्",  cat:"noun",roman:"satyam"},
      ],
      2:[
        {en:"to go",   tr:"गच्छति",  cat:"verb",roman:"gacchati"},
        {en:"to eat",  tr:"खादति",   cat:"verb",roman:"khādati"},
        {en:"to see",  tr:"पश्यति",  cat:"verb",roman:"paśyati"},
        {en:"to speak",tr:"वदति",    cat:"verb",roman:"vadati"},
        {en:"to know", tr:"जानाति",  cat:"verb",roman:"jānāti"},
        {en:"to give", tr:"ददाति",   cat:"verb",roman:"dadāti"},
      ],
      3:[
        {en:"good",    tr:"शुभः",    cat:"adj",roman:"śubhaḥ"},
        {en:"big",     tr:"महान्",   cat:"adj",roman:"mahān"},
        {en:"beautiful",tr:"सुन्दरः",cat:"adj",roman:"sundaraḥ"},
        {en:"new",     tr:"नवः",     cat:"adj",roman:"navaḥ"},
      ]
    },
    sentences:[
      {en:"The child goes",  tr:"बालः गच्छति",  roman:"bālaḥ gacchati"},
      {en:"Water is good",   tr:"जलं शुभम्",    roman:"jalaṃ śubham"},
    ]
  },
};

function getAllWords(lang){
  const db=WORD_DB[lang]; if(!db) return [];
  return Object.values(db.levels).flat();
}
function getWordsByTier(lang,tier){
  const db=WORD_DB[lang]; if(!db) return [];
  return db.levels[tier]||db.levels[1]||[];
}
