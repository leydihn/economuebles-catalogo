document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Esto DEBE detener la recarga

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const data = await response.json();

        if (data.ok) {
            // Si entra, redirige
            window.location.href = '/admin.html';
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error("Error capturado:", error); // Esto saldrá en la consola F12
        alert('Error al conectar con el servidor.');
    }
});