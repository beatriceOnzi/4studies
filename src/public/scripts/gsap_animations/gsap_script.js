gsap.to('.box', {
  opacity: 1,
  scale: 1,
  duration: 2,
  onComplete: () => {
    gsap.to('.box', {
      y: -500,
      borderRadius: '100%',
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'bounce.in',
      rotation: 360
    });
  }
});


gsap.to("#sky", {
    y: -300,

    scrollTrigger:{
        trigger:"#start",
        start:"top top",
        end:"+=500",
        scrub: 1,
        ease: "power1.inOut"
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