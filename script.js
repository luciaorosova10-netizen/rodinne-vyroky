console.log("NOVA VERZIA");

const supabaseUrl = "https://uksuvvtxzhdrkyupgoiz.supabase.co";
const supabaseKey = "sb_publishable_m31mPOeDjcSqYxUivbwsJQ_tTR6gEg8";

const mojSupabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);



async function nacitajVyroky() {

  const { data, error } = await mojSupabase
  .from("vyroky")
  .select("*")
  .order("created_at", { ascending: false });

  let html = "";

  data.forEach(vyrok => {
  html += `
<div class="vyrok">
<div class="text">${vyrok.text}</div>
<span class="lajky" onclick="lajkniVyrok(${vyrok.id})">
❤️ ${vyrok.likes}
</span>
</div>
`;
});

  document.getElementById("zoznamVyrokov").innerHTML = html;

}

nacitajVyroky();

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

await nacitajVyroky();

}

console.log("Script funguje");




