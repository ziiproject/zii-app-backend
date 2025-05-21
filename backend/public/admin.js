document.addEventListener("DOMContentLoaded", () => {
  const ingredientForm = document.getElementById("ingredient-form");
  const ingredientTable = document.querySelector("#ingredient-table tbody");
  const userTable = document.querySelector("#user-table tbody");
  const orderTable = document.querySelector("#order-table tbody");

 
  async function fetchIngredients() {
    try {
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
            <button data-name="${item.name}" data-change="1">+1</button>
            <button data-name="${item.name}" data-change="-1">-1</button>
          </td>
        `;
        ingredientTable.appendChild(row);
      });

      document.querySelectorAll("#ingredient-table button").forEach(btn => {
        btn.addEventListener("click", async () => {
          const name = btn.getAttribute("data-name");
          const change = parseFloat(btn.getAttribute("data-change"));
          await updateIngredient(name, change);
          fetchIngredients();
        });
      });
    } catch (err) {
      console.error("Error fetching ingredients:", err);
    }
  }

  async function updateIngredient(name, change) {
    await fetch("/api/ingredients/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, change })
    });
  }

  ingredientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const quantity = parseFloat(document.getElementById("quantity").value.trim());
    const unit = document.getElementById("unit").value.trim();

    if (!name || isNaN(quantity)) {
      return alert("Please enter a valid name and quantity.");
    }

    await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, unit })
    });

    ingredientForm.reset();
    fetchIngredients();
  });

  
  async function fetchUsers() {
    try {
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
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  
  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      const orders = await res.json();
      orderTable.innerHTML = "";
      orders.forEach(order => {
        const row = document.createElement("tr");
        const itemsFormatted = order.items.map(i => `${i.quantity}x ${i.name}`).join(", ");
        row.innerHTML = `
          <td>${order.id}</td>
          <td>${order.email}</td>
          <td>${itemsFormatted}</td>
          <td>${new Date(order.created_at).toLocaleString()}</td>
        `;
        orderTable.appendChild(row);
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }

  
  fetchIngredients();
  fetchUsers();
  fetchOrders();
});
