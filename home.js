const tracker = new Tracker(); // De Tracker klasse die eerder is gedeeld

// Update maand en jaar in de dropdown
document.querySelector('.month-selector').addEventListener('change', function() {
    const selectedMonth = document.querySelector('.month-selector select:nth-child(1)').value;
    const selectedYear = document.querySelector('.month-selector select:nth-child(2)').value;
    updateMonthlyStats(`${selectedYear}-${selectedMonth}`);
});

function updateMonthlyStats(month) {
    const stats = tracker.getMonthlyStats(month);
    const wordsElement = document.querySelector('.total-stats-words div:nth-child(2)');
    const chaptersElement = document.querySelector('.total-stats-chapters div:nth-child(2)');
    
    // Reset statistieken
    let totalWords = 0;
    let totalChapters = 0;

    for (const data of Object.values(stats)) {
        totalWords += data.words;
        totalChapters += data.chapters;
    }

    wordsElement.textContent = totalWords + " words";
    chaptersElement.textContent = totalChapters + " chapters";
}

// Simuleer activiteitsweergave
document.querySelector('.days').addEventListener('click', function(event) {
    if (event.target.tagName === "DIV") {
        event.target.classList.toggle('active');
    }
});