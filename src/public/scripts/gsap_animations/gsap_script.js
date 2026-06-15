gsap.registerPlugin(ScrollTrigger);

gsap.to("#sky", {
    y: -40,
    ease: "none",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub:true
    }
});

gsap.to("#cloud1", {
    y: -1000,
    ease: "power2.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub:true
    }
});

gsap.to("#cloud2", {
    y: -800,
    ease: "power2.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub:true
    }
});

gsap.to("#mountains", {
    y: -570,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub:true
    }
});

gsap.to("#cachoeira", {
    y: -830,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub:true
    }
});