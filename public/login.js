document.getElementById('loginForm').addEventListener('submit', async (e) => {
    alert("El script se cargó correctamente"); // Si ves este cartel al entrar, el script funciona.
    e.preventDefault();
    // ... resto de tu código ...
});

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