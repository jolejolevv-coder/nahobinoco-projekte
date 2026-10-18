// nahobinoco: Karten austeilen, Karten in die Projektabschnitte legen, Fokus in der Hand.
// Ohne JavaScript bleibt alles lesbar: die Hand liegt offen, die Abschnitte haben ihren Text.

const AUSTEIL_ABSTAND_MS = 90;
const AUFDECK_VERZUG_MS = 260;
const SICHTBAR_AB = 0.35;

const wenigerBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function karteInAbschnittLegen(abschnitt, hand) {
  const vorlage = hand.querySelector(`[data-karte="${abschnitt.id}"] .karte`);
  if (!vorlage) return null;
  const halter = document.createElement("div");
  halter.className = "projekt-karte";
  halter.setAttribute("aria-hidden", "true");
  halter.append(vorlage.cloneNode(true));
  abschnitt.querySelector(".projekt-text").before(halter);
  return halter;
}

function austeilen(hand) {
  const karten = [...hand.querySelectorAll(".handkarte")];
  hand.classList.add("austeilen");
  // Zwei Frames warten, damit der verdeckte Zustand gemalt ist, bevor die Bewegung beginnt.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    karten.forEach((karte, i) => {
      karte.style.transitionDelay = `${i * AUSTEIL_ABSTAND_MS}ms`;
      karte.querySelector(".karte").style.transitionDelay = `${i * AUSTEIL_ABSTAND_MS + AUFDECK_VERZUG_MS}ms`;
    });
    hand.classList.remove("austeilen");
    const letzte = karten.length * AUSTEIL_ABSTAND_MS + AUFDECK_VERZUG_MS + 600;
    setTimeout(() => karten.forEach((karte) => {
      karte.style.transitionDelay = "";
      karte.querySelector(".karte").style.transitionDelay = "";
    }), letzte);
  }));
}

function aufdeckenBeimSehen(halter) {
  const beobachter = new IntersectionObserver((eintraege) => {
    for (const eintrag of eintraege) {
      if (!eintrag.isIntersecting) continue;
      eintrag.target.classList.remove("verdeckt");
      beobachter.unobserve(eintrag.target);
    }
  }, { threshold: SICHTBAR_AB });
  halter.forEach((h) => {
    h.classList.add("verdeckt");
    beobachter.observe(h);
  });
}

function fokusInDerHand(hand) {
  const an = () => hand.classList.add("hat-fokus");
  const aus = () => hand.classList.remove("hat-fokus");
  hand.addEventListener("pointerover", (e) => { if (e.target.closest(".handkarte")) an(); });
  hand.addEventListener("pointerleave", aus);
  hand.addEventListener("focusin", an);
  hand.addEventListener("focusout", aus);
}

function start() {
  const hand = document.querySelector("[data-hand]");
  if (!hand) return;
  const halter = [...document.querySelectorAll("[data-projekt]")]
    .map((abschnitt) => karteInAbschnittLegen(abschnitt, hand))
    .filter(Boolean);
  fokusInDerHand(hand);
  if (wenigerBewegung || !("IntersectionObserver" in window)) return;
  austeilen(hand);
  aufdeckenBeimSehen(halter);
}

start();

// Regler Panel nur lokal mit ?tweak in der Adresse (Phase 6), der Ordner tweak/ wird nie hochgeladen.
if (/[?&]tweak\b/.test(location.search)) {
  const panel = document.createElement("script");
  panel.src = "tweak/tweak.js";
  document.head.append(panel);
}
