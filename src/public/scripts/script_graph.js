async function renderChart() {
    const response = await fetch("/get_all_TimeToday");
    const data = await response.json();

    const days = data.map(day => day.today);
    const hours = data.map(day => day.timeInMsToday / 1000 / 60 / 60);

    const ctx = document.getElementById("graph").getContext("2d");
    const track = document.getElementById("scrollTrack");
    const thumb = document.getElementById("scrollThumb");

    const WINDOW = 14;
    const total = days.length;
    const maxStart = Math.max(0, total - WINDOW);
    let start = maxStart;

    const scrollerPlugin = {
        id: "scroller",
        afterLayout(chart) {
            const { left, right, bottom } = chart.chartArea;
            track.style.left = left + "px";
            track.style.width = (right - left) + "px";
            track.style.top = (bottom + 4) + "px";
            track.style.display = total > WINDOW ? "block" : "none";
            updateThumb();
        }
    };

    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: days,
            datasets: [{
                label: "Hours",
                data: hours,
                borderColor: "#df81d1",
                fill: false,
                cubicInterpolationMode: "monotone",
                tension: 0.4
            }]
        },
        plugins: [scrollerPlugin],
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Hours per Day", color: "white" }
            },
            interaction: { intersect: false },
            scales: {
                x: {
                    min: start,
                    max: Math.min(total - 1, start + WINDOW - 1),
                    ticks: { color: "white" },
                    title: { display: true, text: "Day", color: "white" },
                    grid: { color: "rgba(255, 255, 255, 0.2)" }
                },
                y: {
                    min: 0,
                    max: 24,
                    ticks: { color: "white" },
                    title: { display: true, text: "Hours", color: "white" },
                    grid: { color: "rgba(255, 255, 255, 0.2)" }
                }
            }
        }
    });

    function updateThumb() {
        const trackW = track.clientWidth;
        const thumbW = Math.max(30, trackW * Math.min(1, WINDOW / total));
        const ratio = maxStart === 0 ? 0 : start / maxStart;
        thumb.style.width = thumbW + "px";
        thumb.style.left = ratio * (trackW - thumbW) + "px";
    }

    function setStart(newStart) {
        start = Math.min(maxStart, Math.max(0, Math.round(newStart)));
        chart.options.scales.x.min = start;
        chart.options.scales.x.max = Math.min(total - 1, start + WINDOW - 1);
        chart.update("none");
        updateThumb();
    }

    thumb.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        thumb.setPointerCapture(e.pointerId);
        const startX = e.clientX;
        const startIndex = start;
        const trackW = track.clientWidth;
        const thumbW = thumb.offsetWidth;

        const onMove = (ev) => {
            const dx = ev.clientX - startX;
            const range = trackW - thumbW;
            if (range <= 0) return;
            setStart(startIndex + (dx / range) * maxStart);
        };
        const onUp = () => {
            thumb.removeEventListener("pointermove", onMove);
            thumb.removeEventListener("pointerup", onUp);
        };
        thumb.addEventListener("pointermove", onMove);
        thumb.addEventListener("pointerup", onUp);
    });

    track.addEventListener("pointerdown", (e) => {
        if (e.target !== track) return;
        const rect = track.getBoundingClientRect();
        const thumbW = thumb.offsetWidth;
        const x = e.clientX - rect.left - thumbW / 2;
        setStart((x / (rect.width - thumbW)) * maxStart);
    });

    ctx.canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        setStart(start + Math.sign(e.deltaY));
    }, { passive: false });
}

renderChart();