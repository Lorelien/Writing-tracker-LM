// ====== Voeg standaardboeken toe als ze nog niet bestaan ======
(function initializeDefaultBooks() {
    const defaultBooks = [
        { title: "De Opperdemon", about: "", emoji: "😈", totalWords: 102818, totalChapters: 36 },
        { title: "Not A Typical Ghost Story", about: "", emoji: "👻", totalWords: 7045, totalChapters: 4 },
        { title: "The King and Her Queen", about: "", emoji: "👑", totalWords: 85106, totalChapters: 27 }
    ];
    let books = JSON.parse(localStorage.getItem('books') || '[]');
    const existingTitles = books.map(b => b.title);
    defaultBooks.forEach(book => {
        if (!existingTitles.includes(book.title)) {
            books.push(book);
        }
    });
    localStorage.setItem('books', JSON.stringify(books));
})();

// ====== Book class ======
class Book {
    constructor(title, about, emoji) {
        this.title = title;
        this.about = about;
        this.emoji = emoji;
        this.totalWords = 0;
        this.totalChapters = 0;
    }
    addWriting(words, chapters) {
        this.totalWords += words;
        this.totalChapters += chapters;
    }
}

// ====== WritingLog class ======
class WritingLog {
    constructor(date, book, words, chapters) {
        this.date = date;
        this.book = book;
        this.words = words;
        this.chapters = chapters;
    }
}

// ====== Tracker class ======
class Tracker {
    constructor() {
        this.books = [];
        this.logs = [];
        this.loadBooks();
        this.loadLogs();
    }

    addBook(title, description, emoji) {
        const book = new Book(title, description, emoji);
        this.books.push(book);
        // Save to localStorage
        const books = JSON.parse(localStorage.getItem('books')) || [];
        books.push({ title, about: description, emoji, totalWords: 0, totalChapters: 0 });
        localStorage.setItem('books', JSON.stringify(books));
    }

    loadBooks() {
        const savedBooks = JSON.parse(localStorage.getItem('books')) || [];
        this.books = [];
        savedBooks.forEach(bookData => {
            const book = new Book(bookData.title, bookData.about, bookData.emoji);
            book.totalWords = bookData.totalWords || 0;
            book.totalChapters = bookData.totalChapters || 0;
            this.books.push(book);
        });
    }

    addWritingLog(date, bookTitle, words, chapters) {
        const book = this.books.find(b => b.title === bookTitle);
        if (book) {
            book.addWriting(words, chapters);
            // Vervang log voor deze dag en dit boek (maar meestal is er maar één log per dag)
            this.logs = this.logs.filter(l => !(l.date === date && l.book.title === bookTitle));
            const log = new WritingLog(date, book, words, chapters);
            this.logs.push(log);

            // Save logs to localStorage
            const savedLogs = JSON.parse(localStorage.getItem('writingLogs')) || [];
            // Vervang bestaande log voor deze dag en dit boek
            const filteredLogs = savedLogs.filter(l => !(l.date === date && l.bookTitle === bookTitle));
            filteredLogs.push({ date, bookTitle, words, chapters });
            localStorage.setItem('writingLogs', JSON.stringify(filteredLogs));

            // Update book in localStorage
            const books = JSON.parse(localStorage.getItem('books')) || [];
            const bookIndex = books.findIndex(b => b.title === bookTitle);
            if (bookIndex !== -1) {
                books[bookIndex].totalWords += words;
                books[bookIndex].totalChapters += chapters;
                localStorage.setItem('books', JSON.stringify(books));
            }
        } else {
            console.log("Boek niet gevonden.");
        }
    }

    loadLogs() {
        const savedLogs = JSON.parse(localStorage.getItem('writingLogs')) || [];
        this.logs = [];
        savedLogs.forEach(logData => {
            const book = this.books.find(b => b.title === logData.bookTitle);
            if (book) {
                this.logs.push(new WritingLog(logData.date, book, logData.words, logData.chapters));
            }
        });
    }

    getMonthlyStats(month) {
        const stats = {};
        for (const log of this.logs) {
            if (log.date.startsWith(month)) {
                const bookTitle = log.book.title;
                if (!stats[bookTitle]) {
                    stats[bookTitle] = { words: 0, chapters: 0 };
                }
                stats[bookTitle].words += log.words;
                stats[bookTitle].chapters += log.chapters;
            }
        }
        return stats;
    }

    getTopBook(month) {
        const stats = this.getMonthlyStats(month);
        let topBook = null;
        let maxWords = 0;

        for (const [title, data] of Object.entries(stats)) {
            if (data.words > maxWords) {
                maxWords = data.words;
                topBook = { title, ...data };
            }
        }

        return topBook;
    }
}

// ====== Helper functies ======
function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getMonthStr(year, month) {
    return `${year}-${String(month+1).padStart(2,'0')}`;
}
function getDaysInMonth(year, month) {
    return new Date(year, month+1, 0).getDate();
}

// ====== Tracker instantie ======
const tracker = new Tracker();

// ====== PAGINA-DETECTIE ======
const path = window.location.pathname;

// ---------------- HOME ----------------
if (path.includes('index.html') || path.endsWith('/')) {
    // Kalender logica
    const monthSelect = document.querySelector('.month-selector select:nth-child(1)');
    const yearSelect = document.querySelector('.month-selector select:nth-child(2)');
    const daysDivs = document.querySelectorAll('.days > div');

    function updateCalendar() {
        const month = monthSelect.selectedIndex;
        const year = parseInt(yearSelect.value);
        const daysInMonth = getDaysInMonth(year, month);
        daysDivs.forEach((div, i) => {
            if (i < daysInMonth) {
                div.style.display = '';
                div.classList.remove('has-entry');
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                // Heeft deze dag een log?
                const hasEntry = tracker.logs.some(log => log.date === dateStr);
                if (hasEntry) div.classList.add('has-entry');
            } else {
                div.style.display = 'none';
            }
        });
    }

    monthSelect.addEventListener('change', updateCalendar);
    yearSelect.addEventListener('change', updateCalendar);

    daysDivs.forEach((div, i) => {
        div.addEventListener('click', () => {
            const month = monthSelect.selectedIndex;
            const year = parseInt(yearSelect.value);
            const day = i + 1;
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            window.location.href = `vandaag.html?date=${dateStr}`;
        });
    });

    updateCalendar();

    // Book of the month
    function updateBookOfTheMonth() {
        const now = new Date();
        const monthStr = getMonthStr(now.getFullYear(), now.getMonth());
        const topBook = tracker.getTopBook(monthStr);
        const bookDiv = document.querySelector('.book-of-the-month .book-info');
        if (topBook) {
            const book = tracker.books.find(b => b.title === topBook.title);
            // Emoji tonen als grote emoji (ipv afbeelding)
            let emojiSpan = bookDiv.querySelector('.emoji');
            if (!emojiSpan) {
                emojiSpan = document.createElement('span');
                emojiSpan.className = 'emoji';
                emojiSpan.style.fontSize = '40px';
                emojiSpan.style.marginRight = '10px';
                bookDiv.insertBefore(emojiSpan, bookDiv.firstChild);
            }
            emojiSpan.textContent = book.emoji;
            bookDiv.querySelector('.stats').innerHTML =
                `${topBook.words} words written<br>` +
                `${topBook.chapters} chapters written<br>` +
                `${tracker.logs.filter(l => l.book.title === topBook.title && l.date.startsWith(monthStr)).length} days of writing`;
            if (bookDiv.querySelector('img')) bookDiv.querySelector('img').style.display = 'none';
        } else {
            bookDiv.querySelector('.stats').innerHTML = "No writing this month";
            if (bookDiv.querySelector('.emoji')) bookDiv.querySelector('.emoji').textContent = '';
        }
    }
    updateBookOfTheMonth();

    // Activity icons (emoji's)
    function updateActivityIcons() {
        const iconsDiv = document.querySelector('.activity-icons');
        if (!iconsDiv) return;
        iconsDiv.innerHTML = '';
        tracker.books.forEach(book => {
            const span = document.createElement('span');
            span.textContent = book.emoji;
            span.title = book.title;
            span.style.fontSize = '28px';
            span.style.margin = '0 6px';
            iconsDiv.appendChild(span);
        });
    }
    updateActivityIcons();

    // Total stats
    function updateTotalStats() {
        let totalWords = 0, totalChapters = 0;
        tracker.books.forEach(book => {
            totalWords += book.totalWords;
            totalChapters += book.totalChapters;
        });
        document.querySelector('.total-stats-words > div:last-child').textContent = totalWords.toLocaleString();
        document.querySelector('.total-stats-chapters > div:last-child').textContent = totalChapters;
    }
    updateTotalStats();

    // Weekly writing progress
    function updateWeeklyWriting() {
    // Huidige dag en weekberekening (zondag = 0)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(now.getDate() - now.getDay()); // Zondag

    // Verzamel alle unieke dagen waarop geschreven is deze week
    const writtenDays = new Set();
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        // Kijk of er een log is voor deze dag
        if (tracker.logs.some(log => log.date === dateStr)) {
            writtenDays.add(dateStr);
        }
    }

    const daysWritten = writtenDays.size;

    // Update de progressbalk
    const fillDiv = document.querySelector('.progress-bar .fill');
    if (fillDiv) fillDiv.style.width = `${(daysWritten/7)*100}%`;

    // Update de tekst eronder
    const progressText = document.querySelector('.weekly-writing > div:last-child');
    if (progressText) progressText.textContent = `${daysWritten}/7 days`;
}

}

// ---------------- VANDAAG ----------------
else if (path.includes('vandaag.html')) {
    // Haal datum uit URL
    const params = new URLSearchParams(window.location.search);
    const dateStr = params.get('date') || getTodayStr();

    // Chapters dropdown vullen (bijv. 1 t/m 50)
    const chaptersSelect = document.getElementById('chapters');
    if (chaptersSelect) {
        chaptersSelect.innerHTML = '<option value="">Select chapter</option>';
        for (let i = 1; i <= 50; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            chaptersSelect.appendChild(opt);
        }
    }

    // Dynamische boeken/emoji's tonen als knoppen
    const bookIconsDiv = document.querySelector('.book-icons');
    if (bookIconsDiv) {
        bookIconsDiv.innerHTML = '';
        tracker.books.forEach((book, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'book-icon';
            btn.title = book.title;
            btn.textContent = book.emoji; // Gebruik echte emoji
            btn.style.fontSize = '32px';
            btn.style.backgroundColor = '#fff';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
            btn.style.border = 'none';
            btn.style.padding = '10px';
            btn.style.transition = 'background-color 0.2s';

            btn.addEventListener('click', () => {
                document.querySelectorAll('.book-icon').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });

            bookIconsDiv.appendChild(btn);
        });
    }

    // Bestaande log voor deze dag invullen
    const log = tracker.logs.find(l => l.date === dateStr);
    if (log) {
        document.getElementById('words').value = log.words;
        if (chaptersSelect) chaptersSelect.value = log.chapters;
        // Selecteer juiste boek
        if (bookIconsDiv) {
            const idx = tracker.books.findIndex(b => b.title === log.book.title);
            if (idx !== -1 && bookIconsDiv.children[idx]) {
                bookIconsDiv.children[idx].classList.add('selected');
            }
        }
    }

    // Opslaan
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const words = parseInt(document.getElementById('words').value) || 0;
        const chapters = parseInt(document.getElementById('chapters').value) || 0;
        const selectedBtn = document.querySelector('.book-icon.selected');
        if (!selectedBtn) return alert('Selecteer een boek!');
        const selectedEmoji = selectedBtn.textContent;
        const selectedBook = tracker.books.find(b => b.emoji === selectedEmoji);

        if (words === 0 && chapters === 0) return alert('Vul woorden of hoofdstukken in!');
        tracker.addWritingLog(dateStr, selectedBook.title, words, chapters);

        alert(`Opgeslagen voor boek: ${selectedBook.title}`);
        window.location.href = "index.html";
    });

    // Extra CSS voor selectie (indien niet in je CSS)
    const style = document.createElement('style');
    style.innerHTML = `
    .book-icon.selected {
        background-color: #b0d4f1 !important;
        border: 2px solid #391b4a !important;
    }
    `;
    document.head.appendChild(style);
}

// ---------------- BOEK ----------------
else if (path.includes('boek.html')) {
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const about = document.getElementById('about').value.trim();
        const emoji = document.getElementById('emoji').value.trim();

        if (!title) return alert("Geef een titel op!");
        if (!emoji) return alert("Voeg een emoji toe!");

        tracker.addBook(title, about, emoji);
        alert('Boek toegevoegd!');
        window.location.href = "vandaag.html";
    });
}

if (path.includes('boek.html')) {
    // Emoji-voorstelrij toevoegen onder het emoji-invoerveld
    const emojiInput = document.getElementById('emoji');
    if (emojiInput) {
        // Kies zelf je favoriete emoji's of voeg meer toe
        const emojiList = [
            "😈", "👻", "👑", "🐺", "💧", "💤", "🦄", "📚", "🔥", "🌙", "⭐", "🦊", "🦋", "⛅"
        ];
        const emojiPicker = document.createElement('div');
        emojiPicker.style.display = 'flex';
        emojiPicker.style.flexWrap = 'wrap';
        emojiPicker.style.gap = '8px';
        emojiPicker.style.margin = '8px 0 16px 0';

        emojiList.forEach(emoji => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = emoji;
            btn.style.fontSize = '24px';
            btn.style.background = '#fff';
            btn.style.border = '1px solid #ccc';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
            btn.style.padding = '4px 8px';
            btn.addEventListener('click', () => {
                emojiInput.value = emoji;
            });
            emojiPicker.appendChild(btn);
        });

        emojiInput.parentNode.insertBefore(emojiPicker, emojiInput.nextSibling);
    }

    // Boek toevoegen
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const about = document.getElementById('about').value.trim();
        const emoji = document.getElementById('emoji').value.trim();

        if (!title) return alert("Geef een titel op!");
        if (!emoji) return alert("Voeg een emoji toe!");

        tracker.addBook(title, about, emoji);
        alert('Boek toegevoegd!');
        window.location.href = "vandaag.html";
    });
}

// Automatisch de huidige maand en jaar selecteren bij laden van de pagina
window.addEventListener('DOMContentLoaded', function() {
    // Selecteer de juiste dropdowns
    const monthSelect = document.querySelector('.month-selector select:nth-child(1)');
    const yearSelect = document.querySelector('.month-selector select:nth-child(2)');
    if (!monthSelect || !yearSelect) return;

    const now = new Date();
    const currentMonth = now.getMonth(); // 0 = januari
    const currentYear = now.getFullYear();

    // Zet de geselecteerde maand
    monthSelect.selectedIndex = currentMonth;

    // Zoek de juiste optie voor het huidige jaar en selecteer deze
    for (let i = 0; i < yearSelect.options.length; i++) {
        if (parseInt(yearSelect.options[i].textContent) === currentYear) {
            yearSelect.selectedIndex = i;
            break;
        }
    }

    // Kalender direct updaten
    if (typeof updateCalendar === "function") updateCalendar();
});