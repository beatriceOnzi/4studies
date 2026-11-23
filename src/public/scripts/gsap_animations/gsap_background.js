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

gsap.to("#cloud35", {
    y: -1000,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"body",
        start:"top top",
        end:"+=350",
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

gsap.to("#fog", {
    y: -600,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"=530",
        scrub: 1
    }
});

gsap.to("#forest", {
    y: -650,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"=530",
        scrub: 1
    }
});

gsap.to("#forest2", {
    y: -780,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"=520",
        scrub: 1
    }
});

gsap.to("#fog2", {
    y: -630,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"=500",
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

gsap.to("#fog2", {
    y: -630,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"=500",
        scrub: 1
    }
});

gsap.to("#fog3", {
    y: -660,
    ease: "power3.out",

    scrollTrigger:{
        trigger:"#clock",
        start:"center top",
        end:"=530",
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

gsap.to("#leaves", {
    y: -1000,
    ease: "power1.out",

    scrollTrigger:{
        trigger:"#clock",
        start:"center top",
        end:"+=600",
        scrub: 1
    }
});