function showAlert(type, title, text, duration=5000) { // o timer do swal.fire é sem em milisegundos (1s = 1000ms )
    Swal.fire({
        icon: type,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: duration 
    });
} // A função criada, vai nos permitir utilizar o Swal.fire em diferente te-las sem precisar ficar especificando o todas às vezes. Em seguida, vamos declará-lo no main.handlebars, pois, dessa maneira, vamos conseguir utilizá-la em diferentes páginas.