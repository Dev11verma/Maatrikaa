// Theme toggle with persistence and dynamic favicon
const toggleBtn = document.getElementById("toggleTheme");
const favicon = document.getElementById("favicon");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    toggleBtn.setAttribute("aria-pressed", "true");
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    favicon.href = "favicon-dark.ico"; // Path to your dark mode favicon
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    toggleBtn.setAttribute("aria-pressed", "false");
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    favicon.href = "favicon-light.ico"; // Path to your light mode favicon
  }
  localStorage.setItem("theme", theme);
}

// Initialize theme on load
(function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (prefersDarkScheme.matches) {
    setTheme("dark");
  } else {
    setTheme("light");
  }
})();

toggleBtn.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

// Scroll animations for cards and testimonials
function revealOnScroll() {
  const revealElements = document.querySelectorAll(".card, .testimonial, .newsletter");
  const windowHeight = window.innerHeight;
  const revealPoint = 150; // Offset for when to start revealing

  revealElements.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - revealPoint) {
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll); // Check on load too

// Newsletter form submission feedback
const newsletterForm = document.querySelector(".newsletter form");
const newsletterMessage = document.getElementById("newsletterMessage");

newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const emailInput = newsletterForm.querySelector('input[type="email"]');
  if (emailInput.value.trim() && emailInput.checkValidity()) {
    newsletterMessage.textContent = `Thank you for subscribing, ${emailInput.value.trim()}!`;
    newsletterMessage.className = 'newsletter-message success';
    emailInput.value = ''; // Clear the input field
  } else {
    newsletterMessage.textContent = 'Please enter a valid email address.';
    newsletterMessage.className = 'newsletter-message error';
  }
  // Hide message after a few seconds
  setTimeout(() => {
    newsletterMessage.className = 'newsletter-message';
    newsletterMessage.textContent = '';
  }, 3000);
});

// Product "Order Now" functionality with notification
const cartNotification = document.getElementById('cartNotification');

function showNotification(message) {
  cartNotification.textContent = message;
  cartNotification.classList.add('show');
  setTimeout(() => {
    cartNotification.classList.remove('show');
  }, 2000);
}

// Discount Timer Logic
const countdownTimerElement = document.getElementById('countdownTimer');
const discountBanner = document.querySelector('.discount-timer-banner');
const DISCOUNT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DISCOUNT_END_TIME_KEY = 'maatrikaDiscountEndTime'; // Key for localStorage

let countdownInterval;

function startCountdown() {
  let discountEndTime = localStorage.getItem(DISCOUNT_END_TIME_KEY);
  const currentTime = new Date().getTime();

  if (!discountEndTime || parseInt(discountEndTime) <= currentTime) {
    discountEndTime = currentTime + DISCOUNT_DURATION_MS;
    localStorage.setItem(DISCOUNT_END_TIME_KEY, discountEndTime);
    discountBanner.classList.remove('hidden');
  } else {
    discountEndTime = parseInt(discountEndTime);
    discountBanner.classList.remove('hidden');
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = discountEndTime - now;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownTimerElement.innerHTML = "Offer Ended!";
      discountBanner.classList.add('hidden');
      localStorage.removeItem(DISCOUNT_END_TIME_KEY);
      return;
    }

    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    countdownTimerElement.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Back to Top button logic
const backToTopBtn = document.getElementById('backToTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Hero heading typing animation
const heroHeadingElement = document.getElementById('hero-heading');
const heroText = "Pure <span class=\"highlight\">Organic Skincare</span> For Your Natural Beauty";
let charIndex = 0;

function typeWriter() {
    if (charIndex < heroText.length) {
        // Append characters one by one, handling HTML tags
        if (heroText.substring(charIndex, charIndex + 6) === '<span ') {
            heroHeadingElement.innerHTML += '<span class="highlight">';
            charIndex += 6;
            // Find end of span tag
            let endIndex = heroText.indexOf('</span>', charIndex);
            if (endIndex === -1) endIndex = heroText.length; // Fallback
            
            while (charIndex < endIndex) {
                heroHeadingElement.innerHTML += heroText.charAt(charIndex);
                charIndex++;
            }
            heroHeadingElement.innerHTML += '</span>';
            charIndex += 7; // Skip '</span>'
        } else {
            heroHeadingElement.innerHTML += heroText.charAt(charIndex);
            charIndex++;
        }
        setTimeout(typeWriter, 50); // Typing speed (milliseconds per character)
    } else {
        // Ensure cursor effect continues after typing is complete
        heroHeadingElement.style.borderRight = '3px solid rgba(255, 255, 255, 0.75)';
        heroHeadingElement.style.animation = 'blink-caret 0.75s step-end infinite';
    }
}

// Dynamic Product Loading
const productsGrid = document.getElementById('productsGrid');

async function loadProducts() {
  productsGrid.innerHTML = '<p>Loading products...</p>'; // Show loading message

  try {
    const response = await fetch('products.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();

    productsGrid.innerHTML = ''; // Clear loading message

    products.forEach(product => {
      const productCardWrapper = document.createElement('div');
      productCardWrapper.classList.add('product-card-wrapper');
      productCardWrapper.setAttribute('aria-label', product.name);

      let outOfStockTag = '';
      let orderButtonHtml = '';
      let buttonClass = 'product-btn';
      let buttonDisabled = '';
      let buttonAriaLabel = `Order ${product.name}`;

      if (!product.inStock) {
        outOfStockTag = `<div class="product-out-of-stock">Out of Stock</div>`;
        buttonClass += ' out-of-stock-btn'; // Add a class for disabled styling if needed
        buttonDisabled = 'disabled';
        buttonAriaLabel = `${product.name} is out of stock`;
        orderButtonHtml = `<button class="${buttonClass}" ${buttonDisabled} aria-label="${buttonAriaLabel}">Out of Stock</button>`;
      } else {
        orderButtonHtml = `<button class="${buttonClass}" data-product-id="${product.id}" data-product-name="${product.name}" aria-label="${buttonAriaLabel}">Order Now</button>`;
      }

      productCardWrapper.innerHTML = `
        ${outOfStockTag}
        <article class="product-card" tabindex="0">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <span class="product-price">${product.oldPrice ? `<del>₹${product.oldPrice}</del>` : ''} ₹${product.price}/-</span>
            ${orderButtonHtml}
          </div>
        </article>
      `;
      productsGrid.appendChild(productCardWrapper);
    });

    // Attach event listeners to newly created buttons
    document.querySelectorAll('.product-btn:not([disabled])').forEach(button => {
      button.addEventListener('click', (e) => {
        const productName = e.target.dataset.productName;
        showNotification(`"${productName}" added to cart!`);
      });
    });

  } catch (error) {
    console.error('Failed to load products:', error);
    productsGrid.innerHTML = '<p style="color: var(--error-color);">Failed to load products. Please try again later.</p>';
  }
}

// Initialize everything on page load
window.addEventListener('load', () => {
  startCountdown();
  loadProducts();
  typeWriter(); // Start the hero heading animation
  revealOnScroll(); // Ensure elements are revealed if already in view on load
});
