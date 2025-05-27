import Book from "./Classes/book"; 
import Tracker from "./Classes/Tracker";
import WritingLog from "./Classes/writingLog";

const tracker = new Tracker();

// Add Book Page
if (window.location.pathname.includes('boek.html')) {
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const about = document.getElementById('about').value.trim();
        const emoji = document.getElementById('emoji').value.trim();

        if (title && about && emoji) {
            tracker.addBook(title, about, emoji);
            alert(`Boek "${title}" is succesvol toegevoegd!`);
            window.location.href = 'index.html';
        } else {
            alert('Vul alle velden in.');
        }
    });
}

// Writing Page
if (window.location.pathname.includes('vandaag.html')) {
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

    document.querySelectorAll('.book-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            document.querySelectorAll('.book-icon').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Home Page
if (window.location.pathname.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', function () {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        // Highlight filled days
        const savedData = JSON.parse(localStorage.getItem('writingLogs')) || [];
        savedData.forEach(log => {
            if (log.date.startsWith(currentMonth)) {
                const day = parseInt(log.date.split('-')[2]);
                document.querySelector(`.days div:nth-child(${day})`)?.classList.add('filled');
            }
        });

        // Display top book
        const topBook = tracker.getTopBook(currentMonth);
        const bookSection = document.querySelector('.book-of-the-month');
        if (topBook) {
            bookSection.querySelector('img').src = `Images/${topBook.title.toLowerCase()}.png`;
            bookSection.querySelector('.stats').innerHTML = `
                ${topBook.words} words written<br>
                ${topBook.chapters} chapters written
            `;
        }

        // Update total stats
        const totalWordsElement = document.querySelector('.total-stats-words div:last-child');
        const totalChaptersElement = document.querySelector('.total-stats-chapters div:last-child');
        let totalWords = 0, totalChapters = 0;

        savedData.forEach(log => {
            totalWords += log.words;
            totalChapters += log.chapters;
        });

        totalWordsElement.textContent = totalWords;
        totalChaptersElement.textContent = totalChapters;
    });
}

function generateCalendar(month, year) {
    const daysContainer = document.querySelector('.days');
    daysContainer.innerHTML = ''; // Wis bestaande dagen

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        daysContainer.appendChild(dayElement);
    }
}

document.querySelector('.month-selector select:nth-child(1)').addEventListener('change', function() {
    const month = this.selectedIndex;
    const year = document.querySelector('.month-selector select:nth-child(2)').value;
    generateCalendar(month, year);
});



