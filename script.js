console.log("NOVA VERZIA");

const supabaseUrl = "https://uksuvvtxzhdrkyupgoiz.supabase.co";
const supabaseKey = "sb_publishable_m31mPOeDjcSqYxUivbwsJQ_tTR6gEg8";

const mojSupabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

async function nacitajOsoby() {

  const { data, error } = await mojSupabase
    .from("osoby")
    .select("*")
    .order("meno");
    console.log(data);
console.log(error);

  let html = "";

  let htmlFilter = `
<option value="">
Všetci
</option>
`;

  data.forEach(osoba => {

    html += `
<label>
<input type="checkbox" value="${osoba.id}">
${osoba.meno}
</label>
<br>
`;

htmlFilter += `
<option value="${osoba.id}">
${osoba.meno}
</option>
`;

  });

  document.getElementById("zoznamOsob").innerHTML = html;
  document.getElementById("filterOsoba").innerHTML = htmlFilter;

}

async function nacitajKategorie() {

  const { data, error } = await mojSupabase
    .from("kategorie")
    .select("*")
    .order("nazov");

  console.log(data);
  console.log(error);

  let html = "";

  data.forEach(kategoria => {

    html += `
<label>
<input type="radio" name="kategoria" value="${kategoria.id}">
${kategoria.nazov}
</label>
<br>
`;

  });

  document.getElementById("zoznamKategorii").innerHTML = html;

}

async function nacitajFilterKategorie() {

  const { data, error } = await mojSupabase
    .from("kategorie")
    .select("*")
    .order("nazov");

  console.log(data);
  console.log(error);

  let html = `
<button data-kategoria="">
Všetky
</button>
`;

  data.forEach(kategoria => {

    html += `
<button data-kategoria="${kategoria.id}">
${kategoria.nazov}
</button>
`;
  });

  document.getElementById("filterKategorie").innerHTML = html;

}

async function nacitajRoky() {

  const { data, error } = await mojSupabase
    .from("vyroky")
    .select("rok")
    .not("rok", "is", null);

  console.log(data);
  console.log(error);

  const roky =
    [...new Set(data.map(v => v.rok))]
      .sort((a, b) => b - a);

  let html = "";

  roky.forEach(rok => {

    html += `
<label>
<input type="checkbox" value="${rok}">
${rok}
</label>
<br>
`;

  });

  document.getElementById("zoznamRokov")
    .innerHTML = html;

}

async function nacitajVyroky(
  idsVyrokov = [],
  obnovNahodnyVyrok = true
) {

  const sposobZoradenia =
  document.getElementById("zoradenie").value;

  let query = mojSupabase
  .from("vyroky")
  .select("*");

if (idsVyrokov.length > 0) {
  query = query.in("id", idsVyrokov);
}

if (sposobZoradenia === "najnovsiepridane") {
  query = query.order("created_at", { ascending: false });
}

if (sposobZoradenia === "najnovsie") {

  query = query.order(
    "rok",
    { ascending: false }
  );

}

if (sposobZoradenia === "najstarsie") {

  query = query.order(
    "rok",
    { ascending: true }
  );

}

if (sposobZoradenia === "najoblubenejsie") {

  query = query.order(
    "likes",
    { ascending: false }
  );

}

const { data, error } = await query;

vsetkyVyroky = data;

  let html = "";

  data.forEach((vyrok, index) => {
   const ikonka =
  ikonky[index % ikonky.length];

  html += `

<div class="vyrok">

<div class="rok">${vyrok.rok || ""}</div>

<img
  src="${ikonka}"
  class="ikonka"
>

<div class="text">${vyrok.text}</div>


<span class="lajky" onclick="lajkniVyrok(${vyrok.id})">
Zvýš obľúbenosť výroku →
<span class="srdce">❤️</span>
${vyrok.likes}
</span>

</div>
`;
});

  document.getElementById("zoznamVyrokov").innerHTML = html;

if (obnovNahodnyVyrok) {
  zobrazNahodnyVyrok();
}

}

function zobrazNahodnyVyrok() {

  if (vsetkyVyroky.length === 0) {
    return;
  }

  let vyrok;

  do {

    vyrok =
      vsetkyVyroky[
        Math.floor(
          Math.random() * vsetkyVyroky.length
        )
      ];

  } while (
    vsetkyVyroky.length > 1 &&
    vyrok.id === poslednyNahodnyId
  );

  poslednyNahodnyId = vyrok.id;

  aktualnyNahodnyVyrok = vyrok;

  document.getElementById("nahodnyVyrok").innerHTML = `

<div class="vyrok">

<div class="rok">${vyrok.rok || ""}</div>

<div class="text">${vyrok.text}</div>

<span
class="lajky"
onclick="lajkniVyrok(${vyrok.id})"
>
Zvýš obľúbenosť výroku →
<span class="srdce">❤️</span>
${vyrok.likes}
</span>

</div>

`;

}

async function zaznamenajNavstevu() {

  const { error } = await mojSupabase
    .from("navstevy")
    .insert([{}]);

  console.log("Návšteva zaznamenaná");
  console.log(error);

}

const jeAdminNavsteva =
  new URLSearchParams(window.location.search)
    .get("admin") === "1";

if (!jeAdminNavsteva) {
  zaznamenajNavstevu();
}

const ikonky = [
  "obrazky/lienka.png",
  "obrazky/macka.png",
  "obrazky/margaretka.png",
  "obrazky/motyl.png",
  "obrazky/pes.png",
  "obrazky/slnecnica.png",
  "obrazky/slnko.png",
  "obrazky/stvorlistok.png",
  "obrazky/ruza.png"
];

let vsetkyVyroky = [];

let poslednyNahodnyId = null;

let aktualnyNahodnyVyrok = null;

nacitajVyroky();
nacitajOsoby();
nacitajKategorie();
nacitajFilterKategorie();
nacitajRoky();
nacitajStatistiky();

async function lajkniVyrok(id) {

  const { data, error } = await mojSupabase
    .from("vyroky")
    .select("likes")
    .eq("id", id)
    .single();

  const noveLajky = data.likes + 1;

  const { data: updateData, error: updateError } = await mojSupabase
  .from("vyroky")
  .update({ likes: noveLajky })
  .eq("id", id)
  .select();

console.log("Data:", updateData);


console.log("Update error:", updateError);
console.log("Nový počet:", noveLajky);
console.log("ID výroku:", id);

await nacitajVyroky([], false);

if (aktualnyNahodnyVyrok) {

  document.getElementById("nahodnyVyrok").innerHTML = `

<div class="vyrok">

<div class="rok">${aktualnyNahodnyVyrok.rok || ""}</div>

<div class="text">${aktualnyNahodnyVyrok.text}</div>

<span
class="lajky"
onclick="lajkniVyrok(${aktualnyNahodnyVyrok.id})"
>
Zvýš obľúbenosť výroku →
<span class="srdce">❤️</span>
${noveLajky}
</span>

</div>

`;

}

}


const tlacidlo = document.getElementById("otvorFormular");
const formular = document.getElementById("formular");

tlacidlo.addEventListener("click", () => {

  if (formular.style.display === "none") {
    formular.style.display = "block";
  } else {
    formular.style.display = "none";
  }

});

console.log("Script funguje");

const tlacidloUlozit = document.getElementById("ulozVyrok");

tlacidloUlozit.addEventListener("click", async () => {

  const text = document.getElementById("novyVyrok").value;
  const rok = document.getElementById("rok").value;
  const pridal = document.getElementById("pridal").value;

  const { data, error } = await mojSupabase
  .from("vyroky")
  .insert([
    {
      text: text,
      rok: rok || null,
      pridal: pridal || null,
      likes: 0
    }
  ])
  .select();

  console.log(data);
  console.log(error);

  console.log("ID noveho výroku:");
console.log(data[0].id);

const vyrokId = data[0].id;

const oznaceneOsoby =
  document.querySelectorAll('#zoznamOsob input:checked');

  const vybranaKategoria =
  document.querySelector(
    '#zoznamKategorii input:checked'
  );

for (const osoba of oznaceneOsoby) {

  console.log(osoba.value);

  const { error } = await mojSupabase
    .from("vyrok_osoba")
    .insert([
      {
        vyrok_id: vyrokId,
        osoba_id: osoba.value
      }
    ]);

  console.log(error);

}

if (vybranaKategoria) {

  const { error } = await mojSupabase
    .from("vyrok_kategoria")
    .insert([
      {
        vyrok_id: vyrokId,
        kategoria_id: vybranaKategoria.value
      }
    ]);

  console.log(error);

}

  await nacitajVyroky();

document.getElementById("novyVyrok").value = "";
document.getElementById("rok").value = "";
document.getElementById("pridal").value = "";

});


filterOsoba.addEventListener("change", async () => {

  const osobaId = Number(filterOsoba.value);

  console.log("Vybraná osoba:");
  console.log(osobaId);

 const { data, error } = await mojSupabase
  .from("vyrok_osoba")
  .select("*")
  .eq("osoba_id", osobaId);

  console.log("Data:");
console.log(JSON.stringify(data, null, 2));

console.log("Error:");
console.log(error);

const idsVyrokov = data.map(zaznam => zaznam.vyrok_id);

console.log(idsVyrokov);

await nacitajVyroky(idsVyrokov);

});

document.getElementById("filterKategorie")
.addEventListener("click", async (event) => {

  if (event.target.tagName !== "BUTTON") {
    return;
  }

  const kategoriaId =
    event.target.dataset.kategoria;
    if (kategoriaId === "") {
  await nacitajVyroky();
  return;
}

  console.log("Vybraná kategória:");
  console.log(kategoriaId);

  const { data, error } = await mojSupabase
  .from("vyrok_kategoria")
  .select("*")
  .eq("kategoria_id", kategoriaId);

console.log(data);
console.log(error);

const idsVyrokov =
  data.map(zaznam => zaznam.vyrok_id);

console.log(idsVyrokov);

await nacitajVyroky(idsVyrokov);

});

document.getElementById("zoradenie")
.addEventListener("change", async () => {

  await nacitajVyroky();

});

async function nacitajStatistiky() {

  const { count: pocetVyrokov } = await mojSupabase
    .from("vyroky")
    .select("*", { count: "exact", head: true });

  const { count: pocetNavstev } = await mojSupabase
    .from("navstevy")
    .select("*", { count: "exact", head: true });

    const dnes = new Date();
dnes.setHours(0, 0, 0, 0);

const pred7Dnami = new Date();
pred7Dnami.setDate(pred7Dnami.getDate() - 7);

const pred30Dnami = new Date();
pred30Dnami.setDate(pred30Dnami.getDate() - 30);

const { count: navstevyDnes } = await mojSupabase
  .from("navstevy")
  .select("*", { count: "exact", head: true })
  .gte("created_at", dnes.toISOString());

  const { count: navstevy7Dni } = await mojSupabase
  .from("navstevy")
  .select("*", { count: "exact", head: true })
  .gte("created_at", pred7Dnami.toISOString());

  const { count: navstevy30Dni } = await mojSupabase
  .from("navstevy")
  .select("*", { count: "exact", head: true })
  .gte("created_at", pred30Dnami.toISOString());

  document.getElementById("statistiky").innerHTML = `
  
  <p>Výrokov: ${pocetVyrokov}</p>
  <p>Návštev celkovo: ${pocetNavstev}</p>
  <p>Návštev dnes: ${navstevyDnes}</p>
  <p>Návštev za 7 dní: ${navstevy7Dni}</p>
  <p>Návštev za 30 dní: ${navstevy30Dni}</p>
`;
}

const menuButton =
  document.getElementById("menuButton");

const sidebar =
  document.getElementById("sidebar");

menuButton.addEventListener("click", () => {

  sidebar.classList.toggle("open");

});

document.addEventListener("click", (event) => {

  const klikNaMenu =
    sidebar.contains(event.target);

  const klikNaTlacidlo =
    menuButton.contains(event.target);

  if (
    sidebar.classList.contains("open") &&
    !klikNaMenu &&
    !klikNaTlacidlo
  ) {
    sidebar.classList.remove("open");
  }

});


document.getElementById("menuObsah").appendChild(
  document.getElementById("ovladanie")
);

document
  .getElementById("novyNahodnyVyrok")
  .addEventListener("click", () => {

    zobrazNahodnyVyrok();

});

document.getElementById("zoznamRokov")
.addEventListener("change", async () => {

  const oznaceneRoky =
    document.querySelectorAll(
      '#zoznamRokov input:checked'
    );

  const roky =
    [...oznaceneRoky]
      .map(input => Number(input.value));

  if (roky.length === 0) {
    await nacitajVyroky();
    return;
  }

  const { data, error } = await mojSupabase
    .from("vyroky")
    .select("id")
    .in("rok", roky);

  console.log(data);
  console.log(error);

  const idsVyrokov =
    data.map(vyrok => vyrok.id);

  await nacitajVyroky(idsVyrokov);

});