export default class Tracker {
    constructor() {
        this.books = [];
        this.logs = [];
    }

    addBook(title, description, emoji) {
        const book = new Book(title, description, emoji);
        this.books.push(book);
    }

    addWritingLog(date, bookTitle, words, chapters) {
        const book = this.books.find(b => b.title === bookTitle);
        if (book) {
            book.addWriting(words, chapters);
            const log = new WritingLog(date, book, words, chapters);
            this.logs.push(log);
        } else {
            console.log("Boek niet gevonden.");
        }
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
}; 