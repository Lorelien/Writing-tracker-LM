import Book from "./Classes/book"; 
import Tracker from "./Classes/Tracker";
import WritingLog from "./Classes/writingLog";

const tracker = new Tracker();

// 🚀 **Homepagina: Kalender click-event**
document.addEventListener("DOMContentLoaded", function () {
    const days = document.querySelectorAll(".days div");

    days.forEach(day => {
        day.addEventListener("click", function () {
            const selectedDay = this.textContent.trim(); // Zorgt dat er geen extra spaties zijn
            window.location.href = `vandaag.html?day=${selectedDay}`; // Stuur naar vandaag.html met dag
        });
    });

    // 🏆 **Boek van de maand**
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const topBook = tracker.getTopBook(currentMonth);
    const bookSection = document.querySelector('.book-of-the-month');

    if (topBook) {
        bookSection.querySelector('img').src = `Images/${topBook.title.toLowerCase()}.png`;
        bookSection.querySelector('.stats').innerHTML = `
            ${topBook.words} words written<br>
            ${topBook.chapters} chapters written
        `;
    }

    // 📊 **Total stats bijwerken**
    const totalWordsElement = document.querySelector('.total-stats-words div:last-child');
    const totalChaptersElement = document.querySelector('.total-stats-chapters div:last-child');
    let totalWords = 0, totalChapters = 0;

    const savedData = JSON.parse(localStorage.getItem('writingLogs')) || [];
    savedData.forEach(log => {
        totalWords += log.words;
        totalChapters += log.chapters;
    });

    totalWordsElement.textContent = totalWords;
    totalChaptersElement.textContent = totalChapters;
});

// 📝 **Vandaag-pagina: Schrijfgegevens toevoegen**
if (window.location.pathname.includes('vandaag.html')) {
    document.addEventListener("DOMContentLoaded", function () {
        const params = new URLSearchParams(window.location.search);
        const selectedDay = params.get("day");

        if (selectedDay) {
            document.querySelector("h2").innerHTML = `&lt; Today - ${selectedDay}`;
        }

        // 📚 **Boeken ophalen voor selectie**
        const bookIconsContainer = document.querySelector('.book-icons');
        const savedBooks = JSON.parse(localStorage.getItem('books')) || [];
        savedBooks.forEach(book => {
            const button = document.createElement('button');
            button.classList.add('book-icon');
            button.innerHTML = `<img src="Images/${book.emoji}.png" alt="${book.title}">`;
            button.addEventListener("click", function () {
                document.querySelectorAll('.book-icon').forEach(i => i.classList.remove('active'));
                button.classList.add('active');
            });
            bookIconsContainer.appendChild(button);
        });
    });

    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const chapters = document.getElementById('chapters').value;
        const words = parseInt(document.getElementById('words').value);
        const selectedBook = document.querySelector('.book-icons .active img')?.alt;

        if (!selectedBook) {
            alert('Selecteer een boek.');
            return;
        }

        if (chapters && words) {
            tracker.addWritingLog(new Date().toISOString().slice(0, 10), selectedBook, words, parseInt(chapters));
            alert('Gegevens opgeslagen!');
            window.location.href = 'index.html';
        } else {
            alert('Vul alle velden in.');
        }
    });
}

// 📖 **Boek toevoegen**
if (window.location.pathname.includes('boek.html')) {
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const about = document.getElementById('about').value.trim();
        const emoji = document.getElementById('emoji').value.trim();

        if (title && about && emoji) {
            tracker.addBook(title, about, emoji);
            alert(`Boek "${title}" is succesvol toegevoegd!`);
            window.location.href = 'vandaag.html';
        } else {
            alert('Vul alle velden in.');
        }
    });
}