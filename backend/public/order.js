document.addEventListener("DOMContentLoaded", () => {
  const cart = [];
  const cartList = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const emailInput = document.getElementById("cart-email");

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = btn.closest(".product");
      const name = product.dataset.name;
      const price = parseFloat(product.dataset.price);
      const quantity = parseInt(product.querySelector(".quantity").value, 10);
      cart.push({ name, price, quantity });
      renderCart();
    });
  });

  function renderCart() {
    cartList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const li = document.createElement("li");
      li.innerHTML = `
        ${item.quantity} × ${item.name} — $${(item.price * item.quantity).toFixed(2)}
        <button class="remove-item" data-index="${index}" style="margin-left:10px; color:#fff; background:#d43; border:none; border-radius:5px; cursor:pointer;">❌</button>
      `;
      cartList.appendChild(li);
    });

    cartTotal.textContent = total.toFixed(2);

    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        cart.splice(index, 1);
        renderCart();
      });
    });
  }

  checkoutBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email || cart.length === 0) {
      return alert("Please enter your email and add at least one item.");
    }

    try {
      const res = await fetch("https://zii-app-backend.onrender.com/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, items: cart })
      });
      const data = await res.json();
      if (!res.ok) throw data;
      alert(data.message);
      cart.length = 0;
      renderCart();
    } catch (err) {
      console.error("Order error:", err);
      alert(err.message || "There was a problem placing your order.");
    }
  });
});
