const root = document.querySelector("[data-parallax-root]");
const parallaxItems = root ? [...root.querySelectorAll("[data-depth]")] : [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let rafId = 0;

function updateParallax() {
  currentX += (targetX - currentX) * 0.075;
  currentY += (targetY - currentY) * 0.075;

  parallaxItems.forEach((item) => {
    const depth = Number(item.dataset.depth || 0);
    const x = currentX * depth;
    const y = currentY * depth;
    item.style.setProperty("--px", `${x.toFixed(2)}px`);
    item.style.setProperty("--py", `${y.toFixed(2)}px`);
  });

  rafId = requestAnimationFrame(updateParallax);
}

if (root && !prefersReducedMotion) {
  root.addEventListener(
    "pointermove",
    (event) => {
      const rect = root.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width - 0.5;
      targetY = (event.clientY - rect.top) / rect.height - 0.5;
    },
    { passive: true },
  );

  root.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  rafId = requestAnimationFrame(updateParallax);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
});

const header = document.querySelector(".site-header");
function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

document.querySelectorAll(".gallery-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion) return;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
    card.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  });
});

window.addEventListener("pagehide", () => {
  if (rafId) cancelAnimationFrame(rafId);
});
