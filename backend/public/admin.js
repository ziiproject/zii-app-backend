document.addEventListener("DOMContentLoaded", () => {
  const ingredientForm = document.getElementById("ingredient-form");
  const ingredientTable = document.querySelector("#ingredient-table tbody");
  const userTable = document.querySelector("#user-table tbody");
  const orderTable = document.querySelector("#order-table tbody");

  async function fetchIngredients() {
    const res = await fetch("/api/ingredients");
    const data = await res.json();
    ingredientTable.innerHTML = "";
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td>
          <button onclick="updateIngredient('${item.name}', 1)">+1</button>
          <button onclick="updateIngredient('${item.name}', -1)">-1</button>
        </td>
      `;
      ingredientTable.appendChild(row);
    });
  }

  window.updateIngredient = async (name, change) => {
    await fetch("/api/ingredients/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, change })
    });
    fetchIngredients();
  };

  ingredientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const quantity = parseFloat(document.getElementById("quantity").value.trim());
    const unit = document.getElementById("unit").value.trim();

    await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, unit })
    });

    ingredientForm.reset();
    fetchIngredients();
  });

  async function fetchUsers() {
    const res = await fetch("/api/users");
    const users = await res.json();
    userTable.innerHTML = "";
    users.forEach(user => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>${new Date(user.created_at).toLocaleString()}</td>
      `;
      userTable.appendChild(row);
    });
  }

  async function fetchOrders() {
    const res = await fetch("/api/orders");
    const orders = await res.json();
    orderTable.innerHTML = "";
    orders.forEach(order => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.email}</td>
        <td>${order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</td>
        <td>${new Date(order.created_at).toLocaleString()}</td>
      `;
      orderTable.appendChild(row);
    });
  }

  fetchIngredients();
  fetchUsers();
  fetchOrders();
});
