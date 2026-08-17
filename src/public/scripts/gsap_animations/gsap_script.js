gsap.registerPlugin(ScrollTrigger);

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
    y: -570,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub: 1
    }
});

gsap.to("#cachoeira", {
    y: -830,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
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
