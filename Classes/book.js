export default class Book {
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
}; 



