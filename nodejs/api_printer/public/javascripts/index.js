// var urlPrint = document.getElementById('urlPrint');

// urlPrint.innerHTML = window.location.protocol + '//' + window.location.host + '/print';

function update() {
    let url = window.location.protocol + '//' + window.location.host;
    let printers = document.getElementById('printers');
    if (printers && printers.selectedIndex != -1) {
        let selected = printers.options[printers.selectedIndex].value;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "printer": selected
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(url + '/change', requestOptions)
            .then(async (response) => {
                let json = await response.json();
                if (response.status >= 200 && response.status < 300) {
                    return Promise.resolve(json)
                } else {
                    
                    return Promise.reject(json)
                }
            })
            .then(result => {
                let currentLabel = document.getElementById('currentPrint');
                currentLabel.innerHTML = result.current;
                Swal.fire({
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                })
            })
            .catch(error => {
                Swal.fire({
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                })
                console.log('error', error);
            });
    }
}