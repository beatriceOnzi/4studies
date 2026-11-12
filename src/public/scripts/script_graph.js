async function renderChart() {
    const response = await fetch("/get_all_TimeToday");
    const data = await response.json();

    const days = data.map(day => day.today);
    const hours = data.map(day => day.timeInMsToday / 1000 / 60 / 60);

    const ctx = document.getElementById("graph").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: days,
            datasets: [
                {
                    label: "Hours",
                    data: hours,
                    borderColor: "#df81d1",
                    fill: false,
                    cubicInterpolationMode: "monotone",
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: "Hours per Day",
                    color: "white"
                }
            },
            interaction: {
                intersect: false
            },
            scales: {
                x: {
                    display: true,
                    ticks: { color: "white" },
                    title: { display: true, text: "Day", color: "white" },
                    grid: { color: "rgba(255, 255, 255, 0.2)" }
                },
                y: {
                    display: true,
                    title: { display: true, text: "Hours" },
                    beginAtZero: true,
                    suggestedMax: 24,
                    ticks: { color: "white" },
                    title: { display: true, text: "Hours", color: "white" },
                    grid: { color: "rgba(255, 255, 255, 0.2)" }
                }
            }
        }
    });
}

renderChart();