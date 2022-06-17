document.addEventListener('DOMContentLoaded', (event) => {
    var server_ip;
    var server_port;
    var domain;
    chrome.storage.sync.get(['server_address'], function (parm) {
        server_ip = parm.server_address.ip;
        server_port = parm.server_address.port;
        domain = 'http://' + server_ip + ':' + server_port;
        check();
    });

    console.log('loaded');
    var input_text = document.getElementById('input');
    var tb = document.getElementById('drugs_tbody');

    function update() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', domain + '/local/products?key=' + input_text.value, true);

        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                var jsonResponse = JSON.parse(xhr.responseText);

                tb.innerHTML = "";
                for (var i = 0; i < jsonResponse.length; i++) {
                    var new_tr = document.createElement('tr');

                    var gtn_cell = document.createElement('td');
                    var name_cell = document.createElement('td');

                    var obj = jsonResponse[i];
                    gtn_cell.innerText = obj[0];
                    name_cell.innerText = obj[1];

                    gtn_cell.style.width = '20%';
                    new_tr.appendChild(gtn_cell);
                    new_tr.appendChild(name_cell);

                    tb.appendChild(new_tr);
                }

            } else {

            }
        };
        xhr.send();
    }

    function check() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', domain + '/ping', true);

        let spinner = document.getElementById('spinner');
        let server_message = document.getElementById('server_msg');

        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                server_message.innerText = "متصل به سرور";
                spinner.classList.remove("spinner-border");
                spinner.classList.remove("text-danger");
                spinner.classList.add("spinner-grow");
                spinner.classList.add("text-primary");

            } else {
                server_message.innerText = "در حال یافتن سرور";
                spinner.classList.add("spinner-border");
                spinner.classList.add("text-danger");
                spinner.classList.remove("spinner-grow");
                spinner.classList.remove("text-primary");
            }
        };
        xhr.send();
    }

    input_text.addEventListener("input", async () => {
        console.log('changed');
        update();
    });

});

