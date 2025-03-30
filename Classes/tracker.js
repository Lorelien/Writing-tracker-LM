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