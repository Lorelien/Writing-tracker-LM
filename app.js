// --- Classes (gebruik je eigen modules als je met import/export werkt) ---
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

class WritingLog {
    constructor(date, book, words, chapters) {
        this.date = date;
        this.book = book;
        this.words = words;
        this.chapters = chapters;
    }
}

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
            const log = new WritingLog(date, book, words, chapters);
            this.logs.push(log);

            // Save logs to localStorage
            const savedLogs = JSON.parse(localStorage.getItem('writingLogs')) || [];
            savedLogs.push({ date, bookTitle, words, chapters });
            localStorage.setItem('writingLogs', JSON.stringify(savedLogs));

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

// --- Helper functies ---
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

// --- Tracker instantie ---
const tracker = new Tracker();

// --- PAGINA-DETECTIE ---
const path = window.location.pathname;
if (path.includes('index.html') || path.endsWith('/')) {
    // ---------------- HOME ----------------
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
            // Zoek emoji bij boek
            const book = tracker.books.find(b => b.title === topBook.title);
            if (bookDiv.querySelector('img')) {
                bookDiv.querySelector('img').alt = book.title;
                // Je kunt hier eventueel een mapping naar plaatje doen als je wilt
            }
            bookDiv.querySelector('.stats').innerHTML =
                `${topBook.words} words written<br>` +
                `${topBook.chapters} chapters written<br>` +
                `${tracker.logs.filter(l => l.book.title === topBook.title && l.date.startsWith(monthStr)).length} days of writing`;
        } else {
            bookDiv.querySelector('.stats').innerHTML = "No writing this month";
        }
    }
    updateBookOfTheMonth();

    // Activity icons
    function updateActivityIcons() {
        const iconsDiv = document.querySelector('.activity-icons');
        iconsDiv.innerHTML = '';
        tracker.books.forEach(book => {
            const btn = document.createElement('img');
            btn.alt = book.title;
            // Gebruik eventueel eigen mapping naar plaatje, anders emoji als fallback
            if (book.emoji.startsWith('<img')) {
                btn.src = book.emoji;
            } else if (book.title.toLowerCase() === "wolf") {
                btn.src = "Images/wolf.png";
            } else if (book.title.toLowerCase() === "demon") {
                btn.src = "Images/demon.png";
            } else if (book.title.toLowerCase() === "drop") {
                btn.src = "Images/drop.png";
            } else if (book.title.toLowerCase() === "ghost") {
                btn.src = "Images/ghost.png";
            } else if (book.title.toLowerCase() === "dream") {
                btn.src = "Images/sleeping.png";
            } else if (book.title.toLowerCase() === "crown") {
                btn.src = "Images/crown.png";
            } else {
                // emoji als fallback
                btn.src = `https://emojiapi.dev/api/v1/${encodeURIComponent(book.emoji)}/64.png`;
            }
            iconsDiv.appendChild(btn);
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
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        let daysWritten = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            if (tracker.logs.some(log => log.date === dateStr)) daysWritten++;
        }
        document.querySelector('.progress-bar .fill').style.width = `${daysWritten/7*100}%`;
        document.querySelector('.weekly-writing > div:last-child').textContent = `${daysWritten}/7 days`;
    }
    updateWeeklyWriting();

} else if (path.includes('vandaag.html')) {
    // ---------------- VANDAAG ----------------
    // Haal datum uit URL
    const params = new URLSearchParams(window.location.search);
    const dateStr = params.get('date') || getTodayStr();

    // Chapters dropdown vullen (bijv. 1 t/m 20)
    const chaptersSelect = document.getElementById('chapters');
    chaptersSelect.innerHTML = '<option value="">Select chapter</option>';
    for (let i = 1; i <= 20; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        chaptersSelect.appendChild(opt);
    }

    // Dynamische boeken/emoji's tonen
    const bookIconsDiv = document.querySelector('.book-icons');
    bookIconsDiv.innerHTML = '';
    tracker.books.forEach(book => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'book-icon';
        btn.title = book.title;
        const img = document.createElement('img');
        // Mapping naar image
        if (book.title.toLowerCase() === "wolf") img.src = "Images/wolf.png";
        else if (book.title.toLowerCase() === "demon") img.src = "Images/demon.png";
        else if (book.title.toLowerCase() === "drop") img.src = "Images/drop.png";
        else if (book.title.toLowerCase() === "ghost") img.src = "Images/ghost.png";
        else if (book.title.toLowerCase() === "dream") img.src = "Images/sleeping.png";
        else if (book.title.toLowerCase() === "crown") img.src = "Images/crown.png";
        else img.src = `https://emojiapi.dev/api/v1/${encodeURIComponent(book.emoji)}/64.png`;
        img.alt = book.title;
        btn.appendChild(img);
        btn.addEventListener('click', () => {
            document.querySelectorAll('.book-icon').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        bookIconsDiv.appendChild(btn);
    });

    // Bestaande log voor deze dag invullen
    const log = tracker.logs.find(l => l.date === dateStr);
    if (log) {
        document.getElementById('words').value = log.words;
        chaptersSelect.value = log.chapters;
        // Selecteer juiste boek
        const idx = tracker.books.findIndex(b => b.title === log.book.title);
        if (idx !== -1) {
            bookIconsDiv.children[idx].classList.add('selected');
        }
    }

    // Opslaan
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const words = parseInt(document.getElementById('words').value) || 0;
        const chapters = parseInt(chaptersSelect.value) || 0;
        const selectedBookBtn = document.querySelector('.book-icon.selected');
        if (!selectedBookBtn) return alert('Selecteer een boek!');
        const bookTitle = selectedBookBtn.title;

        if (words === 0 && chapters === 0) return alert('Vul woorden of hoofdstukken in!');
        tracker.addWritingLog(dateStr, bookTitle, words, chapters);
        alert('Opgeslagen!');
        window.location.href = "index.html";
    });

} else if (path.includes('boek.html')) {
    // ---------------- BOEK ----------------
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

// Voeg standaardboeken toe als ze nog niet in localStorage staan
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

// In je homepagina-logica (index.html), vervang of breid deze functie uit:

function updateActivityIcons() {
    const iconsDiv = document.querySelector('.activity-icons');
    iconsDiv.innerHTML = ''; // eerst leegmaken

    tracker.books.forEach(book => {
        const span = document.createElement('span');
        span.textContent = book.emoji; // toon de emoji direct als tekst
        span.title = book.title;
        span.style.fontSize = '28px'; // maak emoji wat groter
        span.style.margin = '0 6px';
        iconsDiv.appendChild(span);
    });
}

updateActivityIcons();

// 1. Dynamisch de emoji's tonen als knoppen
const bookIconsDiv = document.querySelector('.book-icons');
bookIconsDiv.innerHTML = ''; // Leegmaken

// Haal boeken uit localStorage
const books = JSON.parse(localStorage.getItem('books')) || [];

books.forEach((book, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'book-icon';
    btn.title = book.title;
    btn.innerText = book.emoji;
    btn.style.fontSize = '32px';
    btn.style.backgroundColor = '#fff';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
    btn.style.border = 'none';
    btn.style.padding = '10px';
    btn.style.transition = 'background-color 0.2s';

    btn.addEventListener('click', () => {
        // Deselecteer alle andere
        document.querySelectorAll('.book-icon').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });

    bookIconsDiv.appendChild(btn);
});

// 2. Stijl de geselecteerde emoji (bijv. met CSS)
const style = document.createElement('style');
style.innerHTML = `
.book-icon.selected {
    background-color: #b0d4f1 !important;
    border: 2px solid #391b4a !important;
}
`;
document.head.appendChild(style);

// 3. Bij opslaan: haal de geselecteerde emoji op
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const selectedBtn = document.querySelector('.book-icon.selected');
    if (!selectedBtn) return alert('Selecteer een boek!');
    const selectedEmoji = selectedBtn.innerText;
    const selectedBook = books.find(b => b.emoji === selectedEmoji);

    // Lees hoofdstukken en woorden uit
    const chapters = parseInt(document.getElementById('chapters').value) || 0;
    const words = parseInt(document.getElementById('words').value) || 0;

    // Sla log op (gebruik je eigen logica hier)
    // Voorbeeld:
    // tracker.addWritingLog(dateStr, selectedBook.title, words, chapters);

    alert(`Opgeslagen voor boek: ${selectedBook.title}`);
    window.location.href = "index.html";
});