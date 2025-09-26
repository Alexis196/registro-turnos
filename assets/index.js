const startHour = 16;
const endHour = 24;

// Función para formatear fecha en local "YYYY-MM-DD"
function formatFechaLocal(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// Generar tabla dinámicamente con las canchas y reservas
function generarTabla(tbodyId, canchas, reservas) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    for (let h = startHour; h < endHour; h++) {
        const row = document.createElement("tr");
        const mitad = Math.ceil(canchas.length / 2);

        // Primeras canchas antes de la hora
        for (let i = 0; i < mitad; i++) {
            const td = crearCelda(canchas[i], h, reservas);
            row.appendChild(td);
        }

        // Celda de hora
        const horaTd = document.createElement("td");
        horaTd.setAttribute("data-label", "Hora");
        horaTd.textContent = `${h}:00 - ${h + 1}:00`;
        horaTd.style.fontWeight = "bold";
        horaTd.style.textAlign = "center";
        row.appendChild(horaTd);

        // Canchas restantes después de la hora
        for (let i = mitad; i < canchas.length; i++) {
            const td = crearCelda(canchas[i], h, reservas);
            row.appendChild(td);
        }

        tbody.appendChild(row);
    }
}

// Crear celda de cancha
function crearCelda(cancha, hora, reservas) {
    const td = document.createElement("td");
    td.setAttribute("data-label", cancha.cancha);

    const hoyStr = formatFechaLocal(new Date()); // "YYYY-MM-DD"
    console.log(`fecha de hoy ${hoyStr}`);

    const turno = reservas.find(r => {
        // Tomar solo la parte de fecha del string original del backend
        const fechaReservaStr = r.fecha.split("T")[0]; // "YYYY-MM-DD"
        console.log(`fecha de reserva ${fechaReservaStr}`);

        return r.cancha === cancha._id &&
            fechaReservaStr === hoyStr &&
            r.hora === `${hora}:00 - ${hora + 1}:00`;
    });

    if (turno) {
        td.textContent = turno.usuario;
        td.style.backgroundColor = "#f8d7da"; // rojo suave
        td.style.textAlign = "center";
    } else {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Nombre...";
        td.appendChild(input);
        td.style.backgroundColor = "#d4edda"; // verde suave
    }

    return td;
}

// Traer canchas y reservas del backend
async function cargarCanchasYReservas() {
    try {
        const [resCanchas, resReservas] = await Promise.all([
            fetch("http://localhost:4000/api/canchas"),
            fetch("http://localhost:4000/api/reservas/obtenerReservas")
        ]);

        const dataCanchas = await resCanchas.json();
        const dataReservas = await resReservas.json();

        // Separar canchas por tipo
        const padel = dataCanchas.filter(c => c.tipo_cancha === "Pádel");
        const futbol = dataCanchas.filter(c => c.tipo_cancha === "Fútbol 5");

        generarTabla("tabla-padel", padel, dataReservas);
        generarTabla("tabla-futbol", futbol, dataReservas);

        ponerFechaHoy();
    } catch (error) {
        console.error("Error cargando canchas y reservas:", error);
    }
}

// Fecha automática
function ponerFechaHoy() {
    const hoy = new Date();
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = hoy.toLocaleDateString('es-ES', opciones);

    document.getElementById("titulo-padel").textContent =
        "Cancha de Pádel - Fecha: " + fechaFormateada;
    document.getElementById("titulo-futbol").textContent =
        "Cancha de Fútbol 5 - Fecha: " + fechaFormateada;
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarCanchasYReservas();
});
