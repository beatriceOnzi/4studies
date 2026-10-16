gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Observer);

const container = document.getElementById('notes_container');
const EDGE = 0.2;
const MAX_SPEED = 12;

const MIN_SCALE = 0.75;
const MIN_OPACITY = 0.85;
let cards = [];

const state = { speed: 0 };
let setWidth = 0;

function setupLoop() {
    container.querySelectorAll('[data-clone]').forEach(el => el.remove());

    const originals = Array.from(container.children);
    if (!originals.length) return;

    const makeSet = () => originals.map(el => {
        const clone = el.cloneNode(true);
        clone.removeAttribute('id');
        clone.dataset.clone = 'true';
        clone.setAttribute('aria-hidden', 'true');
        return clone;
    });

    const before = makeSet();
    before.forEach(el => container.insertBefore(el, originals[0]));

    let lastEl = originals[originals.length - 1];
    const addAfter = () => makeSet().forEach(el => {
        lastEl.after(el);
        lastEl = el;
    });
    addAfter();

    const firstAfter = originals[originals.length - 1].nextElementSibling;
    setWidth = firstAfter.offsetLeft - originals[0].offsetLeft;

    const extra = Math.ceil(container.clientWidth / setWidth) - 1;
    for (let i = 0; i < extra; i++) addAfter();

    container.scrollLeft = setWidth;
    cards = Array.from(container.children);
    updateScale();
}

function setSpeed(target) {
    gsap.to(state, { speed: target, duration: 0.5, ease: 'power2.out', overwrite: true });
}

container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;

    if (x > 1 - EDGE) setSpeed(((x - (1 - EDGE)) / EDGE) * MAX_SPEED);
    else if (x < EDGE) setSpeed(-((EDGE - x) / EDGE) * MAX_SPEED);
    else setSpeed(0);
});

container.addEventListener('mouseleave', () => setSpeed(0));

gsap.ticker.add(() => {
    if (!setWidth) return;
    const next = container.scrollLeft + state.speed * gsap.ticker.deltaRatio();
    const wrapped = gsap.utils.wrap(setWidth, setWidth * 2, next);
    if (wrapped !== container.scrollLeft) container.scrollLeft = wrapped;
    updateScale();
});

container.addEventListener('input', (e) => {
    const card = e.target.closest('[data-note_id]');
    if (!card) return;
    const selector = e.target.tagName === 'TEXTAREA' ? 'textarea' : 'input[type=text]';
    document.querySelectorAll(`[data-note_id="${card.dataset.note_id}"]`).forEach(other => {
        if (other !== card) other.querySelector(selector).value = e.target.value;
    });
});

function updateScale() {
    const half = container.clientWidth / 2;
    for (const el of cards) {
        const center = el.offsetLeft + el.offsetWidth / 2 - container.scrollLeft;
        const dist = Math.min(Math.abs(center - half) / half, 1);
        el.style.transform = `scale(${gsap.utils.mapRange(0, 1, 1, MIN_SCALE, dist)})`;

        const inner = el.firstElementChild;
        if (inner) inner.style.opacity = gsap.utils.mapRange(0, 1, 1, MIN_OPACITY, dist);
    }
}

setupLoop();
window.addEventListener('resize', setupLoop);

gsap.to("#sky", {
    y: -300,
    ease: "power4.out",

    scrollTrigger:{
        trigger:"#sky",
        start:"top top",
        end:"+=300",
        scrub:true,
    }
});

gsap.to("#cloud1", {
    y: -800,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=200",
        scrub: 1
    }
});

gsap.to("#cloud2", {
    y: -700,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=150",
        scrub: 1
    }
});

gsap.to("#cloud3", {
    y: -812,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=270",
        scrub: 1
    }
});

gsap.to("#cloud4", {
    y: -860,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=450",
        scrub: 1
    }
});

gsap.to("#cloud5", {
    y: -880,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=550",
        scrub: 1
    }
});

gsap.to("#mountains", {
    y: -560,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub: 1
    }
});

gsap.to("#waterfall", {
    y: -800,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=600",
        scrub: 1
    }
});

gsap.to("#tree", {
    y: -880,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"#clock",
        start:"center top",
        end:"+=800",
        scrub: 1
    }
});

// Elements

let tl_clock = gsap.timeline();

tl_clock.from("#clock", {
    duration: 0.8,
    opacity: 0.2,
    scale: 0.2,
    ease: "power3.out"
}).from("#clock_button", {
    opacity: 0,
    scale: 0.2,
    duration: 1,
    ease: "power3.out",
    clearProps: "transform"
});

let clockIn_list_tl = gsap.timeline({ paused: true });

clockIn_list_tl.from("#table_box", {
    opacity: 0,
    y: 70,
    ease: "power3.out",
    duration: 0.7
});

const open_list_btn = document.getElementById("clockIn_list_btn");

open_list_btn.addEventListener("click", () => {
  clockIn_list_tl.restart();
});


gsap.from("#hours_completed", {
    x: -400,
    opacity:0.3,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"#goals",
        start:"center top",
        end: "+=300",
        scrub: 1
    }
})

gsap.from("#goal_hours", {
    x: 400,
    opacity:0.4,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"#goals",
        start:"70% top",
        end: "+=300",
        scrub: 1
    }
})

