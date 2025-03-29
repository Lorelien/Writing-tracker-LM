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
        window.location.href = 'index.html'; // Terug naar de homepagina
    } else {
        alert('Vul alle velden in.');
    }
});

// Boekicoons interactief maken
document.querySelectorAll('.book-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        document.querySelectorAll('.book-icon').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});