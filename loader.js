
function formatHTML(html){

  const tab = "  ";
  let result = "";
  let indent = 0;

  html.replace(/>\s*</g,'>\n<')
  .split('\n')
  .forEach(line => {

    line = line.trim();

    if(line.match(/^<\/.+>/)) indent--;

    result += tab.repeat(Math.max(indent,0)) + line + "\n";

    if(line.match(/^<[^\/!][^>]*[^\/]>$/)) indent++;

  });

  return result.trim();
}

/* ================= CLEANER ================= */

function cleanHTML(html){

return formatHTML(
  html
    .replace(/<figure[^>]*>/gi,'')
    .replace(/<\/figure>/gi,'')
    .replace(/&nbsp;/g,' ')
    .trim()
);

}

/* ================= TINYMCE ================= */

tinymce.init({

  selector:'#editor',

  /* 🔥 CRITICAL FOR SELF HOST */
  base_url: './tinymce/js/tinymce',
  suffix: '.min',

  height:"100%",
  menubar:true,

  plugins: [
    'advlist','autolink','lists','link','image','table',
    'charmap','anchor','searchreplace','visualblocks',
    'code','fullscreen','preview','insertdatetime',
    'help','wordcount','quickbars'
  ],

  toolbar: `
    undo redo |
    blocks |
    bold italic underline |
    alignleft aligncenter alignright alignjustify |
    bullist numlist |
    table image link |
    removeformat |
    code fullscreen preview
  `,

  toolbar_mode:'wrap',
  toolbar_sticky:true,

  menubar:'file edit view insert format tools table help',

  /* SEO SAFE */
  block_formats:
    'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4',

  forced_root_block:'p',

  /* CLEAN OUTPUT */
  invalid_styles:{
    '*':'color font-size font-family background'
  },
license_key: 'gpl',

  paste_remove_styles:true,
  paste_remove_spans:true,
  paste_strip_class_attributes:"all",

  table_toolbar:
    'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',

  table_default_styles:{
    'border-collapse':'collapse',
    width:'100%'
  },

  image_caption:true,
  browser_spellcheck:true,
  entity_encoding:"raw",

  branding:false,

  setup:function(editor){

    editor.on('keyup change paste', debounce(updateHTML,300));

    editor.on('init', updateHTML);
  }

});

/* ================= PERFORMANCE ================= */

function debounce(func,wait){
  let t;
  return function(){
    clearTimeout(t);
    t=setTimeout(func,wait);
  }
}

/* ================= PREVIEW ================= */

function updateHTML(){

let html = tinymce.get('editor').getContent();
html = cleanHTML(html);

document.getElementById('htmlOutput').innerText = html;
}

/* ================= COPY ================= */

function copyHTML(){

let html = document.getElementById('htmlOutput').innerText;

navigator.clipboard.writeText(html);

alert("Clean HTML copied!");

}

