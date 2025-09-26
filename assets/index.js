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

        const horaInicio = `${h.toString().padStart(2, '0')}:00`;
        const horaFin = `${((h + 1) % 24).toString().padStart(2, '0')}:00`;
        horaTd.textContent = `${horaInicio} - ${horaFin}`;

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

// Crear celda de cancha con input para reservar, editar y eliminar
function crearCelda(cancha, hora, reservas) {
    const td = document.createElement("td");
    td.setAttribute("data-label", cancha.cancha);

    const hoyStr = formatFechaLocal(new Date());

    // Encontrar turno
    let turno = reservas.find(r => {
        const fechaReservaStr = r.fecha.split("T")[0];
        return r.cancha === cancha._id &&
            fechaReservaStr === hoyStr &&
            r.hora === `${hora.toString().padStart(2,'0')}:00 - ${((hora+1)%24).toString().padStart(2,'0')}:00`;
    });

    const horaInicio = `${hora.toString().padStart(2, '0')}:00`;
    const horaFin = `${((hora + 1) % 24).toString().padStart(2, '0')}:00`;

    const renderCelda = () => {
        td.innerHTML = "";

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
            td.style.textAlign = "left";

            // Guardar reserva al terminar de escribir
            input.addEventListener("blur", async () => {
    const nombre = input.value.trim();
    if (!nombre) return;

    const nuevaReserva = {
        cancha: cancha._id,
        usuario: nombre,
        fecha: hoyStr,
        hora: `${horaInicio} - ${horaFin}`
    };

    console.log("Enviando reserva:", nuevaReserva);

    try {
        const res = await fetch("http://localhost:4000/api/reservas/reservar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaReserva)
        });

        if (!res.ok) {
            const error = await res.json();
            alert(`Error: ${error.mensaje || res.statusText}`);
            input.value = "";
            return;
        }

        // Aquí tomamos la reserva real que devuelve el backend
        const data = await res.json();
        turno = data.reserva; // ✅ contiene _id real

        // Agregamos la reserva al array local
        reservas.push(turno);

        renderCelda(); // actualizar la celda sin recargar la página

    } catch (err) {
        console.error("No se pudo guardar la reserva:", err);
        alert("No se pudo guardar la reserva");
    }
});

        }
    };

    // Agregar click para editar reserva
    td.addEventListener("click", () => {
        if (!turno) return;
        td.innerHTML = "";

        const input = document.createElement("input");
        input.type = "text";
        input.value = turno.usuario;
        td.appendChild(input);
        td.style.backgroundColor = "#fff";
        input.focus();

        input.addEventListener("blur", async () => {
            const nombre = input.value.trim();

            if (!nombre) {
                // eliminar
                try {
                    const res = await fetch(`http://localhost:4000/api/reservas/eliminar-reserva/${turno._id}`, {
                        method: "DELETE"
                    });
                    if (res.ok) {
                        // eliminar también del array local
                        reservas.splice(reservas.indexOf(turno), 1);
                        turno = null;
                        renderCelda();
                    } else {
                        const err = await res.json();
                        alert(`Error eliminando: ${err.mensaje || res.statusText}`);
                        renderCelda();
                    }
                } catch (err) {
                    console.error(err);
                    alert("Error eliminando la reserva");
                    renderCelda();
                }
                return;
            }

            // actualizar
            try {
                const res = await fetch(`http://localhost:4000/api/reservas/modificar-reserva/${turno._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cancha: turno.cancha,
                        usuario: nombre,
                        fecha: hoyStr,
                        hora: turno.hora
                    })
                });

                if (res.ok) {
                    turno.usuario = nombre;
                    renderCelda();
                } else {
                    const err = await res.json();
                    alert(`Error editando: ${err.mensaje || res.statusText}`);
                    renderCelda();
                }
            } catch (err) {
                console.error(err);
                alert("Error editando la reserva");
                renderCelda();
            }
        });
    });

    renderCelda();
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
