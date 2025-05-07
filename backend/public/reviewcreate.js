document.addEventListener("DOMContentLoaded", () => {
    loadReviewImages();
  
    const form = document.getElementById("review-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("review-name").value.trim();
      const message = document.getElementById("review-text").value.trim();
      const canvas = document.getElementById("reviewCanvas");
      const ctx = canvas.getContext("2d");
  
      ctx.fillStyle = "#f9bab1";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      ctx.font = "16px Poppins";
      ctx.fillText(`Name: ${name}`, 20, 40);
      ctx.fillText("Review:", 20, 80);
      
      const lines = message.match(/.{1,40}/g);
      lines.forEach((line, i) => {
        ctx.fillText(line, 20, 110 + i * 20);
      });
  
      const imageBase64 = canvas.toDataURL("image/png");
  
      const response = await fetch("https://zii-app-backend.onrender.com/api/reviews-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 })
      });
  
      if (response.ok) {
        alert("Review submitted!");
        form.reset();
        loadReviewImages();
      } else {
        alert("Submission failed.");
      }
    });
  });
  
  async function loadReviewImages() {
    const res = await fetch("https://zii-app-backend.onrender.com/api/review-images");
    const images = await res.json();
    const container = document.getElementById("review-slideshow");
    container.innerHTML = "";
  
    images.forEach((path, i) => {
      const img = document.createElement("img");
      img.src = path;
      img.style.display = i === 0 ? "block" : "none";
      img.className = "review-slide";
      container.appendChild(img);
    });
  }
  