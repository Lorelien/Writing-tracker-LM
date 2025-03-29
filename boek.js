document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const about = document.getElementById('about').value;
    const emoji = document.getElementById('emoji').value;

    if (title && about && emoji) {
        tracker.addBook(title, about, emoji);
        alert(`Boek "${title}" is succesvol toegevoegd!`);
        window.location.href = 'index.html'; // Ga terug naar de homepagina
    } else {
        alert('Vul alle velden in.');
    }
});