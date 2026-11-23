async function renderChart() {
    const response = await fetch("/get_all_TimeToday");
    const data = await response.json();

    const byDate = new Map(
        data.map(day => [day.today, day.timeInMsToday / 1000 / 60 / 60])
    );

    const sortedKeys = [...byDate.keys()].sort();
    const startDate = new Date(sortedKeys[0] + "T00:00:00Z");
    
    const now = new Date();
    const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const days = [];
    const hours = [];
    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        days.push(key);
        hours.push(byDate.get(key) ?? 0);
    }

    const weekStart = (iso) => {
        const d = new Date(iso + "T00:00:00Z");
        d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
        return d.toISOString().slice(0, 10);
    };

    const weekMap = new Map();
    days.forEach((day, i) => {
        const key = weekStart(day);
        weekMap.set(key, (weekMap.get(key) ?? 0) + hours[i]);
    });
    const weeks = [...weekMap.keys()];
    const weekHours = [...weekMap.values()];

    const modes = {
        day:  { labels: days,  data: hours,     window: 30, title: "Hours per Day" },
        week: { labels: weeks, data: weekHours, window: 12, title: "Hours per Week" }
    };
    let currentMode = "day";

    const ctx = document.getElementById("graph").getContext("2d");
    const track = document.getElementById("scrollTrack");
    const thumb = document.getElementById("scrollThumb");

    let WINDOW = modes.day.window;
    let total = days.length;
    let maxStart = Math.max(0, total - WINDOW);
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
                tension: 0.4
            }]
        },
        plugins: [scrollerPlugin],
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Hours per Day", color: "white", font: { family: "'My Soul', sans-serif", size: 24 } },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const label = items[0].label;
                            if (currentMode === "day") return formatDate(label);
                            const end = new Date(label + "T00:00:00Z");
                            end.setUTCDate(end.getUTCDate() + 6);
                            return `${formatDate(label)} → ${formatDate(end.toISOString().slice(0, 10))}`;
                        }
                    }
                }
            },
            interaction: { intersect: false },
            scales: {
                x: {
                    min: start,
                    max: Math.min(total - 1, start + WINDOW - 1),
                    ticks: {
                        padding: 15,
                        color: "rgba(255,255,255,0.9)",
                        font: { family: "'Italianno', sans-serif", size: 15 },
                        maxRotation: 35,
                        minRotation: 35,
                        callback: function (value) {
                            const label = this.getLabelForValue(value);
                            const [, month, day] = label.split("-");
                            return `${day}/${month}`;
                        }
                    },
                    grid: { color: "rgba(255, 255, 255, 0.2)" }
                },
                                
                y: {
                    min: 0,
                    max: Math.ceil(Math.max(...hours)),
                    ticks: { color: "white", font: { family: "'Italianno', sans-serif", size: 22 }},
                    title: { display: true, text: "Hours", color: "white", font: { family: "'My Soul', sans-serif", size: 24 } },
                    grid: { color: "rgba(255, 255, 255, 0.2)" }
                }
            }
        }
    });

    function formatDate(iso) {
        const [year, month, day] = iso.split("-");
        return `${day}-${month}-${year}`;
    };

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

    function applyMode(name) {
    const m = modes[name];
    currentMode = name;

    WINDOW = m.window;
    total = m.labels.length;
    maxStart = Math.max(0, total - WINDOW);
    start = maxStart; // começa mostrando o período mais recente

    chart.data.labels = m.labels;
    chart.data.datasets[0].data = m.data;
    chart.options.plugins.title.text = m.title;
    chart.options.scales.y.max = Math.ceil(Math.max(...m.data));
    chart.options.scales.x.min = start;
    chart.options.scales.x.max = Math.min(total - 1, start + WINDOW - 1);

    chart.update("none");
    track.style.display = total > WINDOW ? "block" : "none";
    updateThumb();
}

    const wrap = document.getElementById("mainDisplay"); // pai: só perspectiva
    const card = document.getElementById("flipCard");    // o que gira

    gsap.set(wrap, { perspective: 1200 });

    let isFlipping = false;
    const modeOrder = ["day", "week"];

    function flipTo(dir) {
        if (isFlipping) return;

        const idx = modeOrder.indexOf(currentMode);
        const name = modeOrder[(idx + dir + modeOrder.length) % modeOrder.length];

        isFlipping = true;

        gsap.timeline({ onComplete: () => { isFlipping = false; } })
            .to(card, { rotationY: -90 * dir, duration: 0.35, ease: "power2.in" })
            .add(() => applyMode(name))
            .set(card, { rotationY: 90 * dir })
            .to(card, { rotationY: 0, duration: 0.35, ease: "power2.out" });
    }

    document.querySelectorAll(".edge").forEach(el =>
        el.addEventListener("click", () => flipTo(Number(el.dataset.dir)))
    );

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