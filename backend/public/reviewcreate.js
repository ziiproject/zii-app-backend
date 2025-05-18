document.addEventListener("DOMContentLoaded", () => {
  loadReviewImages();

  const form = document.getElementById("review-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("review-name").value.trim();
    const message = document.getElementById("review-text").value.trim();
    const canvas = document.getElementById("reviewCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.fillStyle = "#f9bab1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.font = "16px Poppins";
    ctx.fillText(`Name: ${name}`, 20, 40);
    ctx.fillText("Review:", 20, 80);

    const lines = message.match(/.{1,40}/g) || [];
    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 110 + i * 20);
    });

    const imageBase64 = canvas.toDataURL("image/png");

    try {
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
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong.");
    }
  });
});

async function loadReviewImages() {
  try {
    const res = await fetch("https://zii-app-backend.onrender.com/api/review-images");
    const images = await res.json();
    const container = document.getElementById("review-slideshow");
    container.innerHTML = "";

    images.forEach((path, i) => {
      const img = document.createElement("img");
      img.src = path;
      img.alt = "User review";
      img.style.display = i === 0 ? "block" : "none";
      img.style.width = "100%";
      img.style.maxWidth = "400px";
      img.style.margin = "20px auto";
      img.style.borderRadius = "16px";
      img.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.2)";
      img.style.border = "4px solid white";
      img.style.backgroundClip = "content-box, border-box";
      img.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      img.style.backgroundImage = "linear-gradient(white, white), linear-gradient(to right, #f9bab1, #f4978e)";
      img.style.backgroundOrigin = "border-box";
      img.style.backgroundClip = "content-box, border-box";

      img.onerror = () => {
        console.warn("Broken image skipped:", img.src);
        img.remove();
      };

      img.addEventListener("mouseover", () => {
        img.style.transform = "scale(1.03)";
        img.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.3)";
      });
      img.addEventListener("mouseout", () => {
        img.style.transform = "scale(1)";
        img.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.2)";
      });

      container.appendChild(img);
    });
  } catch (err) {
    console.error("Error loading images:", err);
  }
}
