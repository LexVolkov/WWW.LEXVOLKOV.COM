(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Єдиний момент входу: розпал бренду
  requestAnimationFrame(() => {
    document.body.classList.add("is-lit");
  });

  // Акордеон проєктів: один відкритий одночасно
  const projects = document.querySelectorAll(".project");

  projects.forEach((project) => {
    const toggle = project.querySelector(".project__toggle");
    if (!(toggle instanceof HTMLButtonElement)) return;

    toggle.addEventListener("click", () => {
      const willOpen = !project.classList.contains("is-open");

      projects.forEach((other) => {
        other.classList.remove("is-open");
        const otherToggle = other.querySelector(".project__toggle");
        if (otherToggle instanceof HTMLButtonElement) {
          otherToggle.setAttribute("aria-expanded", "false");
        }
      });

      if (willOpen) {
        project.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Email: частини в data-* у зворотному порядку, збираємо лише по кліку
  const mailBtn = document.getElementById("mail-btn");
  if (mailBtn instanceof HTMLButtonElement) {
    const decodePart = (value) => [...value].reverse().join("");

    mailBtn.addEventListener("click", () => {
      const user = decodePart(mailBtn.dataset.u || "");
      const domain = decodePart(mailBtn.dataset.d || "");
      if (!user || !domain) return;

      const address = `${user}@${domain}`;
      mailBtn.textContent = `Email · ${address}`;
      mailBtn.setAttribute("aria-label", `Написати на ${address}`);
      window.location.href = `mailto:${address}`;
    });
  }

  if (reduce) return;

  const canvas = document.getElementById("sparks");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const sparks = [];
  const COUNT = 48;
  let width = 0;
  let height = 0;
  let raf = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(partial = false) {
    return {
      x: width * (0.25 + Math.random() * 0.5),
      y: height * (0.15 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.25 - Math.random() * 0.7,
      r: 0.6 + Math.random() * 1.8,
      life: partial ? Math.random() : 1,
      decay: 0.003 + Math.random() * 0.006,
      hue: 18 + Math.random() * 22,
    };
  }

  function init() {
    sparks.length = 0;
    for (let i = 0; i < COUNT; i += 1) sparks.push(spawn(true));
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < sparks.length; i += 1) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      if (s.life <= 0 || s.y < -10) {
        sparks[i] = spawn();
        continue;
      }

      const alpha = Math.max(0, s.life) * 0.85;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${s.hue}, 95%, ${55 + s.life * 20}%, ${alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(tick);
  }

  resize();
  init();
  tick();

  window.addEventListener("resize", () => {
    resize();
    init();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(tick);
    }
  });
})();
