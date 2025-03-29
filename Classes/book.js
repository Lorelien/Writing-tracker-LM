export default class Book {
    constructor(title, about, emoji) {
        this.id = Date.now().toString(); //unieke id 
        this.title = title; 
        this.about = about; 
        this.emoji = emoji; 
        this.logs = []; 
    }
}