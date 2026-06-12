const state = {
  typedIndex: 0,
  typedChar: 0,
  typedForward: true,
  typedValues: ["AI Explorer", "Tech Enthusiast", "Future Builder", "Problem Solver"],
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  trailX: window.innerWidth / 2,
  trailY: window.innerHeight / 2,
  easterClicks: 0
};
const supabaseKey = "sb_publishable_a0dl5qrwqgurOwf5yFdihQ_bgSX0dmn";
const supabaseUrl = "https://pcufpmzdnoxihsvtpidn.supabase.co";
const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);
const loader = document.querySelector(".loader");
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
const cursor = document.getElementById("cursor");
const cursorTrail = document.getElementById("cursor-trail");
const scrollProgressBar = document.getElementById("scroll-progress-bar");
const visitorCount = document.getElementById("visitor-count");
const typedText = document.getElementById("typed-text");
const backToTop = document.getElementById("back-to-top");
const toast = document.getElementById("toast");
const form = document.getElementById("contact-form");
const formStartedAt = document.getElementById("form-started-at");
const radarCanvas = document.getElementById("skill-radar");
const particleCanvas = document.getElementById("particle-canvas");
const easterEgg = document.getElementById("easter-egg");

const particleCtx = particleCanvas.getContext("2d");
const radarCtx = radarCanvas.getContext("2d");

const particles = [];

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.borderColor = isError ? "rgba(255, 102, 102, 0.35)" : "rgba(212, 175, 55, 0.18)";
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!bodyText) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(bodyText);
  }

  try {
    return JSON.parse(bodyText);
  } catch (error) {
    return { message: bodyText };
  }
}

function formatVisitorCount(value) {
  return new Intl.NumberFormat().format(value);
}

function resizeCanvas(canvas, ctx) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function resizeRadarCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const size = 420;
  radarCanvas.width = size * ratio;
  radarCanvas.height = size * ratio;
  radarCanvas.style.width = "100%";
  radarCanvas.style.height = "auto";
  radarCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function initParticles() {
  resizeCanvas(particleCanvas, particleCtx);
  particles.length = 0;
  const count = Math.min(120, Math.round(window.innerWidth / 12));

  for (let index = 0; index < count; index += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.8 + Math.random() * 2.2,
      vx: -0.18 + Math.random() * 0.36,
      vy: -0.15 + Math.random() * 0.3,
      alpha: 0.22 + Math.random() * 0.46
    });
  }
}

function drawParticles() {
  particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particleCtx.fillStyle = "rgba(212, 175, 55, 1)";
  particleCtx.strokeStyle = "rgba(212, 175, 55, 0.15)";

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;

    particleCtx.beginPath();
    particleCtx.globalAlpha = particle.alpha;
    particleCtx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    particleCtx.fill();

    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
      const other = particles[otherIndex];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 120) {
        particleCtx.globalAlpha = ((120 - distance) / 120) * 0.16;
        particleCtx.beginPath();
        particleCtx.moveTo(particle.x, particle.y);
        particleCtx.lineTo(other.x, other.y);
        particleCtx.stroke();
      }
    }
  });

  particleCtx.globalAlpha = 1;
  requestAnimationFrame(drawParticles);
}

function animateCursor() {
  state.trailX += (state.mouseX - state.trailX) * 0.12;
  state.trailY += (state.mouseY - state.trailY) * 0.12;

  if (cursor) {
    cursor.style.transform = `translate(${state.mouseX}px, ${state.mouseY}px) translate(-50%, -50%)`;
  }

  if (cursorTrail) {
    cursorTrail.style.transform = `translate(${state.trailX}px, ${state.trailY}px) translate(-50%, -50%)`;
  }

  requestAnimationFrame(animateCursor);
}

function updateScrollProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const progress = total > 0 ? window.scrollY / total : 0;
  scrollProgressBar.style.width = `${Math.min(progress * 100, 100)}%`;
  if (backToTop) {
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  }
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.classList.contains("skill-card")) {
            const progress = entry.target.querySelector(".progress span");
            const level = entry.target.getAttribute("data-level");
            if (progress) {
              progress.style.width = `${level}%`;
            }
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.22 }
  );

  elements.forEach((element) => observer.observe(element));
}

function animateCounters() {
  document.querySelectorAll(".counter").forEach((counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const elapsed = Math.min((now - start) / duration, 1);
      const value = Math.round(target * (1 - Math.pow(1 - elapsed, 3)));
      counter.textContent = String(value);
      if (elapsed < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = String(target);
      }
    }

    requestAnimationFrame(step);
  });
}

function typeText() {
  const current = state.typedValues[state.typedIndex];
  const visibleText = current.slice(0, state.typedChar);
  typedText.textContent = visibleText;

  if (state.typedForward) {
    if (state.typedChar < current.length) {
      state.typedChar += 1;
    } else {
      state.typedForward = false;
      window.setTimeout(typeText, 900);
      return;
    }
  } else if (state.typedChar > 0) {
    state.typedChar -= 1;
  } else {
    state.typedForward = true;
    state.typedIndex = (state.typedIndex + 1) % state.typedValues.length;
  }

  window.setTimeout(typeText, state.typedForward ? 90 : 36);
}

function drawRadarChart() {
  const width = 420;
  const height = 420;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;
  const axes = [
    { label: "Code", value: 0.92, angle: -Math.PI / 2 },
    { label: "Design", value: 0.82, angle: -Math.PI / 6 },
    { label: "Systems", value: 0.87, angle: Math.PI / 6 },
    { label: "Research", value: 0.9, angle: Math.PI / 2 },
    { label: "Communication", value: 0.84, angle: (5 * Math.PI) / 6 },
    { label: "Adaptation", value: 0.89, angle: (7 * Math.PI) / 6 }
  ];

  radarCtx.clearRect(0, 0, width, height);
  radarCtx.save();
  radarCtx.translate(centerX, centerY);

  for (let ring = 1; ring <= 4; ring += 1) {
    radarCtx.beginPath();
    const ringRadius = (radius / 4) * ring;
    for (let index = 0; index < axes.length; index += 1) {
      const angle = axes[index].angle;
      const x = Math.cos(angle) * ringRadius;
      const y = Math.sin(angle) * ringRadius;
      if (index === 0) radarCtx.moveTo(x, y);
      else radarCtx.lineTo(x, y);
    }
    radarCtx.closePath();
    radarCtx.strokeStyle = "rgba(212, 175, 55, 0.12)";
    radarCtx.stroke();
  }

  axes.forEach((axis) => {
    radarCtx.beginPath();
    radarCtx.moveTo(0, 0);
    radarCtx.lineTo(Math.cos(axis.angle) * radius, Math.sin(axis.angle) * radius);
    radarCtx.strokeStyle = "rgba(212, 175, 55, 0.16)";
    radarCtx.stroke();

    const labelX = Math.cos(axis.angle) * (radius + 22);
    const labelY = Math.sin(axis.angle) * (radius + 22);
    radarCtx.fillStyle = "#f4e3ad";
    radarCtx.font = "14px Space Grotesk";
    radarCtx.textAlign = labelX > 0 ? "left" : "right";
    radarCtx.fillText(axis.label, labelX, labelY);
  });

  radarCtx.beginPath();
  axes.forEach((axis, index) => {
    const pointRadius = radius * axis.value;
    const x = Math.cos(axis.angle) * pointRadius;
    const y = Math.sin(axis.angle) * pointRadius;
    if (index === 0) radarCtx.moveTo(x, y);
    else radarCtx.lineTo(x, y);
  });
  radarCtx.closePath();
  const gradient = radarCtx.createLinearGradient(-radius, -radius, radius, radius);
  gradient.addColorStop(0, "rgba(212, 175, 55, 0.2)");
  gradient.addColorStop(1, "rgba(242, 210, 122, 0.45)");
  radarCtx.fillStyle = gradient;
  radarCtx.strokeStyle = "rgba(242, 210, 122, 0.8)";
  radarCtx.lineWidth = 2;
  radarCtx.fill();
  radarCtx.stroke();

  axes.forEach((axis) => {
    const pointRadius = radius * axis.value;
    const x = Math.cos(axis.angle) * pointRadius;
    const y = Math.sin(axis.angle) * pointRadius;
    radarCtx.beginPath();
    radarCtx.arc(x, y, 4, 0, Math.PI * 2);
    radarCtx.fillStyle = "#fff4d0";
    radarCtx.fill();
  });

  radarCtx.restore();
}

function handleFilter(category) {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === category);
  });

  document.querySelectorAll(".project-card").forEach((card) => {
    const show = category === "all" || card.dataset.category === category;
    card.style.display = show ? "grid" : "none";
  });
}

async function loadVisitorCount() {
  try {
    const { data, error } = await supabaseClient
      .from("visitor_counter")
      .select("visitors")
      .eq("id", 1)
      .single();

    if (error) throw error;

    let count = data.visitors;

    if (!localStorage.getItem("portfolio_visited")) {
      count++;

      const { error: updateError } = await supabaseClient
        .from("visitor_counter")
        .update({ visitors: count })
        .eq("id", 1);

      if (updateError) throw updateError;

      localStorage.setItem("portfolio_visited", "true");
    }

    visitorCount.textContent = count.toLocaleString();

  } catch (error) {
    console.error("Visitor counter error:", error);
    visitorCount.textContent = "1";
  }
}

async function submitContactForm(event) {
  event.preventDefault();

  const payload = {
    fullName: form.fullName.value.trim(),
    email: form.email.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
    company: form.company.value.trim(),
    formStartedAt: formStartedAt.value
  };

  if (!payload.fullName || !payload.email || !payload.subject || !payload.message) {
    showToast("Please complete all required fields.", true);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    showToast("Please enter a valid email address.", true);
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data?.error || data?.message || "Something went wrong.");
    }

    form.reset();
    formStartedAt.value = String(Date.now());
    showToast(data?.message || "Message sent successfully.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Message";
  }
}

function setupMobileNav() {
  if (!navToggle || !siteNav) return;
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupInteractions() {
  window.addEventListener("mousemove", (event) => {
    state.mouseX = event.clientX;
    state.mouseY = event.clientY;
  });

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", () => {
    resizeCanvas(particleCanvas, particleCtx);
    resizeRadarCanvas();
    drawRadarChart();
    initParticles();
    updateScrollProgress();
  });

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  easterEgg.addEventListener("click", () => {
    state.easterClicks += 1;
    if (state.easterClicks >= 3) {
      showToast("Easter egg unlocked: golden loop engaged.");
      document.documentElement.style.setProperty("--gold", "#f5c85e");
      document.documentElement.style.setProperty("--gold-2", "#fff0bf");
      state.easterClicks = 0;
    } else {
      showToast("Tap 3 times to unlock the hidden mode.");
    }
  });

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => handleFilter(button.dataset.filter));
  });

  formStartedAt.value = String(Date.now());
  form.addEventListener("submit", submitContactForm);
}

window.addEventListener("load", () => {
  loader.classList.add("is-hidden");
  setupReveal();
  animateCounters();
  setupMobileNav();
  setupInteractions();
  resizeRadarCanvas();
  drawRadarChart();
  initParticles();
  drawParticles();
  animateCursor();
  typeText();
  loadVisitorCount();
  updateScrollProgress();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  showToast("Premium portfolio loaded.");
});
