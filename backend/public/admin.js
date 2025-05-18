document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ingredient-form");
  const list = document.getElementById("ingredient-list");

  async function fetchIngredients() {
    const res = await fetch("/api/ingredients");
    const data = await res.json();
    list.innerHTML = "";
    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name}: ${item.quantity} ${item.unit}`;
      list.appendChild(li);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    const unit = document.getElementById("unit").value.trim();

    await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, unit })
    });

    form.reset();
    fetchIngredients();
  });

  fetchIngredients();
});
