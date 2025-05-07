document.addEventListener("DOMContentLoaded", () => {
  //  Review Slideshow 
  const reviewImg = document.getElementById("reviewImage");
  if (reviewImg) {
    const reviewImages = [
      "images/review1.jpg",
      "images/review2.jpg",
      "images/review3.jpg",
      "images/review4.jpg",
      "images/review5.jpg",
      "images/review6.jpg"
    ];
    let reviewIndex = 0, reviewInterval, reviewPaused = false;

    const nextBtn  = document.getElementById("reviewNextBtn");
    const prevBtn  = document.getElementById("reviewPrevBtn");
    const pauseBtn = document.getElementById("reviewPauseBtn");

    function showReviewSlide() {
      if (!reviewImages.length) return;
      reviewIndex = (reviewIndex + reviewImages.length) % reviewImages.length;
      reviewImg.src = reviewImages[reviewIndex];
    }
    function nextReview() { reviewIndex++; showReviewSlide(); }
    function prevReview() { reviewIndex--; showReviewSlide(); }
    function toggleReviewPause() {
      if (reviewPaused) {
        reviewInterval = setInterval(nextReview, 3000);
        pauseBtn.innerText = "Pause";
      } else {
        clearInterval(reviewInterval);
        pauseBtn.innerText = "Play";
      }
      reviewPaused = !reviewPaused;
    }
    nextBtn?.addEventListener("click", () => { clearInterval(reviewInterval); nextReview(); });
    prevBtn?.addEventListener("click", () => { clearInterval(reviewInterval); prevReview(); });
    pauseBtn?.addEventListener("click", toggleReviewPause);

    fetch("https://zii-app-backend.onrender.com/api/review-images")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(dynamic => {
        dynamic.forEach(path => {
          if (!reviewImages.includes(path)) reviewImages.push(path);
        });
        showReviewSlide();
        reviewInterval = setInterval(nextReview, 3000);
      })
      .catch(err => {
        console.error("Failed loading review-images:", err);
        showReviewSlide();
        reviewInterval = setInterval(nextReview, 3000);
      });
  }

  
    // Menu Slideshow 
    const menuImg = document.getElementById("menuImage");
  
    if (menuImg) {
      const menuImages = [
        "images/prices1.jpg",
        "images/prices2.jpg",
        "images/policies.jpg"
      ];
  
      let menuIndex = 0;
      let menuInterval;
      let menuPaused = false;
  
      const menuNextBtn = document.getElementById("menuNextBtn");
      const menuPrevBtn = document.getElementById("menuPrevBtn");
      const menuPauseBtn = document.getElementById("menuPauseBtn");
  
      function showMenuSlide() {
        if (menuIndex >= menuImages.length) menuIndex = 0;
        if (menuIndex < 0) menuIndex = menuImages.length - 1;
        menuImg.src = menuImages[menuIndex];
      }
  
      function nextMenu() {
        menuIndex++;
        showMenuSlide();
      }
  
      function prevMenu() {
        menuIndex--;
        showMenuSlide();
      }
  
      function toggleMenuPause() {
        if (menuPaused) {
          menuInterval = setInterval(() => { menuIndex++; showMenuSlide(); }, 3000);
          menuPauseBtn.innerText = "Pause";
        } else {
          clearInterval(menuInterval);
          menuPauseBtn.innerText = "Play";
        }
        menuPaused = !menuPaused;
      }
  
      menuNextBtn?.addEventListener("click", () => { clearInterval(menuInterval); nextMenu(); });
      menuPrevBtn?.addEventListener("click", () => { clearInterval(menuInterval); prevMenu(); });
      menuPauseBtn?.addEventListener("click", toggleMenuPause);
  
      showMenuSlide();
      menuInterval = setInterval(() => { menuIndex++; showMenuSlide(); }, 3000);
    }
  });
  