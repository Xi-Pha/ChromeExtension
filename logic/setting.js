document.addEventListener('DOMContentLoaded', (event) => {

    let apply_button = document.getElementById('save_btn');
    let port_input = document.getElementById('port_input');
    let ip_input = document.getElementById('ip_input');

    apply_button.addEventListener("click", async () => {
        save();
    });

    function save() {
        let _ip = ip_input.value;
        let _port = port_input.value;
        if (_ip == "") {
            alert('IP can not be empty');
            return;
        }
        if (!ValidateIPaddress(_ip)) {
            alert('IP is not valid');
            return;
        }
        if (!ValidatePort(_port)) {
            alert('Port is not valid');
            return;
        }
        function ValidateIPaddress(ipaddress) {
            if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
                return (true)
            }
            return (false)
        }
        function ValidatePort(port) {
            if (port >= 0 && port <= 65535) {
                return (true)
            }
            return (false)
        }
        
        chrome.storage.sync.set({ server_address: { ip: _ip, port: _port } }, function () {

            apply_button.innerText = "Saved";
            apply_button.disabled = true;

            setTimeout(() => {
                apply_button.innerText = "Save";
                apply_button.disabled = false;
                chrome.storage.sync.get(['server_address'], function (parm) {
                    console.log('ip :' + parm.server_address.ip);
                    console.log('port :' + parm.server_address.port);
                });
            }, 5000);

        });
    }
});