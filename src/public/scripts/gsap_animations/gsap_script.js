gsap.to("#sky", {
    y: -40,

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub: 1,
        ease: "power1.inOut"
    }
});

gsap.to("#mountains", {
    y: -400,

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub: 1,
        ease: "power4.out",
        onComplete: () => {
            gsap.to('.box', {
                pin: true,
            });
        }
    }
});



gsap.to(".cloud1", {
    y: -250,

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub: 1,
        ease: "power1.inOut"
    }
});

gsap.to(".cloud2", {
    y: -400,

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub: 1,
        ease: "power1.inOut"
    }
});