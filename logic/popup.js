document.addEventListener('DOMContentLoaded', (event) => {
    let apply_button = document.getElementById('apply_btn');
    let database_button = document.getElementById('database_btn');
    let factor_button = document.getElementById('factor');
    let define_button = document.getElementById('define');

    var server_ip;
    var server_port;
    var domain;

    chrome.storage.sync.get(['server_address'], function (parm) {
        server_ip = parm.server_address.ip;
        server_port = parm.server_address.port;
        domain = 'http://' + server_ip + ':' + server_port;
        console.log(domain);
        check();
    });

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


    apply_button.addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: apply_variables,
        });
    });

    database_button.addEventListener("click", async () => {
        window.open('database.html','_blank');
    });

    factor_button.addEventListener("click", async () => {
        window.open('factor.html','_blank');
    });

    define_button.addEventListener("click", async () => {
        window.open('define.html','_blank');
    });

    function apply_variables() {
        var TAMIN_URL = 'https://darman.tamin.ir/Forms/EPresc/EPrescDrugStore.aspx?pagename=hdpEPrescDrugStore';
        var SALAMAT_URL = 'https://eservices.ihio.gov.ir/ihioerx/';

        if (window.location.href == TAMIN_URL) {
            create('__TAMIN__', tamin());
        }
        if (window.location.href == SALAMAT_URL) {
            create('__SALAMAT__', salamat());
        }

        console.log(doctor());

        function doctor() {
            var DOCTOR_UID_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lbldocid"]';
            var DOCTOR_FIRST_NAME_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lbldocname"]';
            var DOCTOR_LAST_NAME_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lbldocfamily"]';
            var DOCTOR_SPEC_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lblspecdoc"]';

            var _doctor_id = getElementByXpath(DOCTOR_UID_XPATH).innerText;
            var _doctor_name = getElementByXpath(DOCTOR_FIRST_NAME_XPATH).innerText;
            var _doctor_family = getElementByXpath(DOCTOR_LAST_NAME_XPATH).innerText;
            var _doctor_speciallity = getElementByXpath(DOCTOR_SPEC_XPATH).innerText;

            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://localhost:5020/doctor', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                Id: _doctor_id,
                Name: _doctor_name + " " + _doctor_family,
                Spec: _doctor_speciallity
            }));
            xhr.onload = function () {
                var data = JSON.parse(this.responseText);
                console.log("hi" + data);
            };
        }

        function tamin() {

            // pathes
            var DRUG_ROW_TEMPLATE_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_grdServiceList_DXDataRow{@id}"]';
            var PATIENT_NAME_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lblname"]';
            var PATIENT_FAMILY_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lblfamily"]';
            var PRESCRIPTION_DATE_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lblprescdate"]';
            var DOCTOR_NAME_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lbldocname"]';
            var DOCTOR_FAMILY_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lbldocfamily"]';
            var DOCTOR_UID_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_lbldocid"]';
            var NATIONAL_CODE_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_hidNationalcode"]';
            var TABLE_XPATH = '//*[@id="ctl00_ContentPlaceHolder1_grdServiceList_DXMainTable"]';

            // read header data
            var _patinet_name = getElementByXpath(PATIENT_NAME_XPATH).innerText + " " + getElementByXpath(PATIENT_FAMILY_XPATH).innerText;
            var _prescription_date = getElementByXpath(PRESCRIPTION_DATE_XPATH).innerText;
            var _doctor_name = getElementByXpath(DOCTOR_NAME_XPATH).innerText + " " + getElementByXpath(DOCTOR_FAMILY_XPATH).innerText;
            var _doctor_uid = getElementByXpath(DOCTOR_UID_XPATH).innerText;
            var _national_code = getElementByXpath(NATIONAL_CODE_XPATH).value;

            // read main data
            var _records_count = getElementByXpath(TABLE_XPATH).rows.length - 2;
            var data = Array.from(Array(_records_count), () => new Array(3))

            for (var index = 0; index < _records_count; index++) {
                var _name = getElementByXpath(DRUG_ROW_TEMPLATE_XPATH.replace('{@id}', index.toString()) + '/td[4]').innerText;
                var _count = getElementByXpath(DRUG_ROW_TEMPLATE_XPATH.replace('{@id}', index.toString()) + '/td[9]').innerText;
                var _inst = getElementByXpath(DRUG_ROW_TEMPLATE_XPATH.replace('{@id}', index.toString()) + '/td[10]').innerText;
                data[index][0] = _name;
                data[index][1] = _count;
                data[index][2] = _inst;
            }
            return [
                [
                    _patinet_name,
                    _prescription_date,
                    _doctor_name,
                    _doctor_uid,
                    _national_code
                ], data
            ];
        }

        function salamat() {
            var BASE_XPATH = '/html/body/div[2]/div[2]/div[2]/div[2]/div/div/div[2]/div/div/div[2]/div[2]/table/tbody';
            var MEDICINE_NAME_TEMPLATE_XPATH = BASE_XPATH + '/tr[@INDEX]/td[3]/span';
            var MEDICINE_COUNT_TEMPLATE_XPATH = BASE_XPATH + '/tr[@INDEX]/td[4]';
            var MEDICINE_INSTRUCTION_TEMPLATE_XPATH = BASE_XPATH + '/tr[@INDEX]/td[6]/span';
            var MEDICINE_SPECIAL_INSTRUCTION_TEMPLATE_XPATH = BASE_XPATH + '/tr[@INDEX]/td[1]/table/tbody/tr/td[2]/button'


            var _patient_name = getElementByXpath('/html/body/div[2]/div[2]/div[2]/div[2]/div/div/div[2]/div/div/div[1]/span[2]').innerHTML.replace('شما در حال ارائه خدمات برای', ' ').replace('هستید.', ' ');
            var _national_code = getElementByXpath('//*[@id="tbNationalNumber"]').value;
            var _prescription_code = getElementByXpath('//*[@id="tbTrackingCode"]').value;
            var _prescription_date = getElementByXpath('/html/body/div[2]/div[2]/div[2]/div[2]/div/div/div[2]/div/div/div[1]/div/table/tbody/tr[2]/td[3]/span').innerText;
            var _doctor_name = getElementByXpath('/html/body/div[2]/div[2]/div[2]/div[2]/div/div/div[2]/div/div/div[1]/div/table/tbody/tr[2]/td[2]/span').innerText;

            var _records_count = getElementByXpath('/html/body/div[2]/div[2]/div[2]/div[2]/div/div/div[2]/div/div/div[2]/div[2]/table').rows.length - 1;

            var data = Array.from(Array(_records_count), () => new Array(3))

            for (var index = 0; index < _records_count; index++) {
                var _name = getElementByXpath(MEDICINE_NAME_TEMPLATE_XPATH.replace('@INDEX', (index + 1).toString())).innerHTML;
                var _count = getElementByXpath(MEDICINE_COUNT_TEMPLATE_XPATH.replace('@INDEX', (index + 1).toString())).innerHTML;
                var _inst = getElementByXpath(MEDICINE_INSTRUCTION_TEMPLATE_XPATH.replace('@INDEX', (index + 1).toString())).innerHTML;

                var _spec_inst_cell_element = getElementByXpath(MEDICINE_SPECIAL_INSTRUCTION_TEMPLATE_XPATH.replace('@INDEX', (index + 1).toString()));

                _inst = _spec_inst_cell_element === null ? _inst : _inst + ' ' + _spec_inst_cell_element.title;

                data[index][0] = _name;
                data[index][1] = _count;
                data[index][2] = _inst;
            }

            return [
                [
                    _patient_name,
                    _prescription_date,
                    _doctor_name,
                    'NULL',
                    _national_code,
                    _prescription_code
                ], data
            ];
        }

        function create(org, data) {

            var HEAD_DATA = data[0];
            var MAIN_DATA = data[1];

            var new_document = document.implementation.createHTMLDocument('print');
            // var header_element = new_document.createElement('div');
            // header_element.style.textAlign = 'center';
            // header_element.innerText = 'نسخه‌ی الکترونیک بیمه‌ی سلامت';
            // header_element.style.border = '2px solid black';
            // header_element.style.fontFamily = 'Vazirmatn';
            // header_element.style.fontSize = '18px';

            var page_frame_element = new_document.createElement('div');
            var page_inner_element = new_document.createElement('div');

            var info_frame_element = new_document.createElement('div');
            var info_inner_element = new_document.createElement('div');

            var _patient_name_element = new_document.createElement('div');
            var _doctor_name_element = new_document.createElement('div');
            var _doctor_uid_element = new_document.createElement('div');
            var _prescription_date_element = new_document.createElement('div');
            var _national_code_element = new_document.createElement('div');

            _patient_name_element.innerText = "نام بیمار [" + HEAD_DATA[0] + ']';
            _prescription_date_element.innerText = "تاریخ تجویز [ " + HEAD_DATA[1] + ' ]';
            _doctor_name_element.innerText = "پزشک معالج [ " + HEAD_DATA[2] + ' ]';
            _doctor_uid_element.innerText = "نظام پزشکی [ " + HEAD_DATA[3] + ' ]';
            _national_code_element.innerText = "کد ملی [ " + HEAD_DATA[4] + ' ]';


            info_inner_element.appendChild(_patient_name_element);
            info_inner_element.appendChild(_doctor_name_element);
            info_inner_element.appendChild(_doctor_uid_element);
            info_inner_element.appendChild(_prescription_date_element);
            info_inner_element.appendChild(_national_code_element);

            if (org == '__SALAMAT__') {

                var _prescription_code_element = new_document.createElement('div');

                _prescription_code_element.innerText = "کد رهگیری [ " + HEAD_DATA[5] + ' ]';
                _prescription_code_element.style.padding = "2px";

                info_inner_element.appendChild(_prescription_code_element);
            }

            info_frame_element.appendChild(info_inner_element);

            var first_spacer_element = new_document.createElement('div');
            var second_spacer_element = new_document.createElement('div');
            var table_element = new_document.createElement('table');
            var table_body = new_document.createElement('tbody');

            table_body.style.fontFamily = 'Vazirmatn';

            for (var i = 0; i < data[1].length; i++) {

                var tr = new_document.createElement('tr');

                var _name_cell = new_document.createElement('td');
                var _count_cell = new_document.createElement('td');
                var _inst_cell = new_document.createElement('td');

                _name_cell.appendChild(new_document.createTextNode(MAIN_DATA[i][0]));
                _count_cell.appendChild(new_document.createTextNode(MAIN_DATA[i][1]));
                _inst_cell.appendChild(new_document.createTextNode(MAIN_DATA[i][2]));

                _name_cell.style.border = "1px solid black";
                _count_cell.style.border = "1px solid black";
                _inst_cell.style.border = "1px solid black";

                _name_cell.style.borderCollapse = "collapse";
                _count_cell.style.borderCollapse = "collapse";
                _inst_cell.style.borderCollapse = "collapse";

                _name_cell.style.padding = "5px";
                _count_cell.style.padding = "5px";
                _inst_cell.style.padding = "5px";

                _name_cell.style.borderWidth = "2px";
                _count_cell.style.borderWidth = "2px";
                _inst_cell.style.borderWidth = "2px";

                _inst_cell.style.direction = "rtl";
                _inst_cell.style.width = '30%'
                _count_cell.style.textAlign = "center";

                tr.style.padding = "5px";


                tr.appendChild(_name_cell);
                tr.appendChild(_count_cell);
                tr.appendChild(_inst_cell);
                // add row to table
                table_body.appendChild(tr);
            }


            ////////////////////////////////////////////

            _patient_name_element.style.padding = "2px";
            _doctor_name_element.style.padding = "2px";
            _prescription_date_element.style.padding = "2px";
            _national_code_element.style.padding = "2px";

            info_frame_element.style.padding = "5px";
            info_inner_element.style.direction = 'rtl';
            info_inner_element.style.fontFamily = 'Vazirmatn';
            info_frame_element.margin = "5px";

            first_spacer_element.style.height = "5px";
            second_spacer_element.style.height = "5px";

            table_element.appendChild(table_body);

            //page_inner_element.appendChild(header_element);
            page_inner_element.appendChild(first_spacer_element);
            page_inner_element.appendChild(info_frame_element);
            page_inner_element.appendChild(second_spacer_element);
            page_inner_element.appendChild(table_element);

            page_frame_element.appendChild(page_inner_element);


            var my = window.open("", "MsgWindow", "width=700,height=500");

            // load font to document
            var link = my.document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v32.102/Vazirmatn-Variable-font-face.css';
            my.document.head.appendChild(link);

            page_frame_element.style.width = "8cm";
            page_frame_element.style.boxSizing = "border-box";
            table_element.style.borderCollapse = "collapse";
            page_frame_element.style.fontSize = "12px";
            table_body.style.fontSize = "12px";
            page_inner_element.style.padding = "5px";
            info_frame_element.style.border = "2px solid black";

            my.document.getElementsByTagName('body')[0].appendChild(page_frame_element);
            my.document.body.style.padding = 0;
            my.document.body.style.margin = 0;

        }

        function getElementByXpath(path) {
            return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }
    }
})

