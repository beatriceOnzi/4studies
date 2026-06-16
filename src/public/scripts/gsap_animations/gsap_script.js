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
    y: -600,
    ease: "power1.in",

    scrollTrigger:{
        trigger:"#cloud1",
        start:"-25% top",
        end:"+=100",
        scrub:true
    }
});

gsap.to("#cloud2", {
    y: -650,
    ease: "power2.out",

    scrollTrigger:{
        trigger:"#cloud2",
        start:"-160% top",
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