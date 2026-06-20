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
    ease: "power1.in",

    scrollTrigger:{
        trigger:"#cloud1",
        start:"-50% top",
        end:"+=200",
        scrub:true
    }
});

gsap.to("#cloud2", {
    y: -430,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=150",
        scrub:true,
        markers: true
    }
});

gsap.to("#cloud3", {
    y: -800,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=300",
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