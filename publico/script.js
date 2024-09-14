document.addEventListener('DOMContentLoaded', () => {
    const selectDepartamento = document.getElementById('seleccion-departamento');
    const entradaPalabra = document.getElementById('entrada-palabra');
    const entradaLocalizacion = document.getElementById('entrada-localizacion');
    const botonBuscar = document.getElementById('boton-buscar');
    const contenedorTarjetas = document.getElementById('contenedor-tarjetas');
    const botonAnterior = document.getElementById('anterior');
    const botonSiguiente = document.getElementById('siguiente');
    const paginaActualTexto = document.getElementById('pagina-actual');
    const urlAPI = 'https://collectionapi.metmuseum.org/public/collection/v1/';
    let paginaActual = 1;
    let totalPaginas = 0;
    let idsObjetos = [];

    botonBuscar.onclick = buscarElementos;

    // Cargar el select con los departamentos
    async function cargarSelect() {
        try {
            const respuesta = await fetch(`${urlAPI}departments`);
            const data = await respuesta.json();

            data.departments.forEach(departamento => {
                const opcionSelect = document.createElement('option');
                opcionSelect.setAttribute('value', departamento.departmentId);
                opcionSelect.textContent = departamento.displayName;
                selectDepartamento.appendChild(opcionSelect);
            });

            // Agregar el evento change para cargar las tarjetas automáticamente
            selectDepartamento.addEventListener('change', cargarTarjetasPorDepartamento);
        } catch (error) {
            console.error('Error al cargar los departamentos:', error);
        }
    }

    // Buscar elementos según palabra clave y localización
    async function buscarElementos(event) {
        event.preventDefault();

        try {
            const palabra = entradaPalabra.value;
            const localizacionValor = entradaLocalizacion.value;
            let url = `${urlAPI}search?q=${palabra}&hasImages=true`; // Filtra por objetos con imágenes

            if (localizacionValor) {
                url += `&geoLocation=${localizacionValor}`;
            }

            const respuesta = await fetch(url);
            const data = await respuesta.json();

            if (data.objectIDs && data.objectIDs.length > 0) {
                idsObjetos = data.objectIDs;
                totalPaginas = Math.ceil(idsObjetos.length / 20);
                paginaActual = 1;
                mostrarPagina(paginaActual);
                actualizarBotones();
            } else {
                contenedorTarjetas.innerHTML = 'No se encontraron elementos.';
            }

        } catch (error) {
            console.error('Error al buscar el elemento', error);
        }
    }

    // Mostrar una página de resultados
    async function mostrarPagina(pagina) {
        const inicio = (pagina - 1) * 20;
        const fin = inicio + 20;
        const objetosPagina = idsObjetos.slice(inicio, fin);

        contenedorTarjetas.innerHTML = ''; // Limpiar tarjetas anteriores

        for (const objetoID of objetosPagina) {
            const objetoRespuesta = await fetch(`${urlAPI}objects/${objetoID}`);
            const objetoData = await objetoRespuesta.json();
            crearTarjeta(objetoData);
        }

        paginaActualTexto.textContent = paginaActual;
    }

    // Crear tarjeta de objeto
    function crearTarjeta(objeto) {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta');

        tarjeta.innerHTML = `
            <img src="${objeto.primaryImageSmall || 'https://via.placeholder.com/150'}" alt="${objeto.title}" class="tarjeta-img-superior">
            <div class="cuerpo-tarjeta">
                <h5 class="titulo-tarjeta">${objeto.title}</h5>
                <p class="texto-tarjeta">Cultura: ${objeto.culture || 'Desconocido'}</p>
                <p class="texto-tarjeta">Dinastía: ${objeto.dynasty || 'Desconocido'}</p>
            </div>
        `;

        contenedorTarjetas.appendChild(tarjeta);
    }

    // Función para cargar tarjetas por departamento
    async function cargarTarjetasPorDepartamento() {
        const departamentoId = selectDepartamento.value;

        if (!departamentoId) {
            contenedorTarjetas.innerHTML = 'Selecciona un departamento.';
            return;
        }

        try {
            const respuesta = await fetch(`${urlAPI}search?departmentId=${departamentoId}&hasImages=true`);
            const data = await respuesta.json();

            if (data.objectIDs && data.objectIDs.length > 0) {
                idsObjetos = data.objectIDs;
                totalPaginas = Math.ceil(idsObjetos.length / 20);
                paginaActual = 1;
                mostrarPagina(paginaActual);
                actualizarBotones();
            } else {
                contenedorTarjetas.innerHTML = 'No se encontraron elementos para el departamento seleccionado.';
            }
        } catch (error) {
            console.error('Error al cargar los objetos del departamento:', error);
        }
    }

    // Funciones para paginación
    botonAnterior.onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarPagina(paginaActual);
            actualizarBotones();
        }
    };

    botonSiguiente.onclick = () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarPagina(paginaActual);
            actualizarBotones();
        }
    };

    // Actualizar estado de los botones de paginación
    function actualizarBotones() {
        botonAnterior.disabled = paginaActual === 1;
        botonSiguiente.disabled = paginaActual === totalPaginas;
    }

    
    cargarSelect();
});



