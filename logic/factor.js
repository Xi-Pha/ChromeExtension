document.addEventListener('DOMContentLoaded', (event) => {

    $('#navigation').load("../navbar.html");

    // here is some data for test
    // [distributor , date , factor no , price , tax , off , final]
    var tmp = [
        ['پخش زاگرس', '14010231', '1299', '317387538', '22525339', '678102', '339234775'],
        ['شرکت داروسازان التیام', '14010231', '328', '26853144', '0', '452300', '26400844'],
        ['پخش دایا', '14010301', '4831', '56712990', '1165573', '0', '57878563'],
        ['دارو گستر باریج اسانس', '14010301', '1456', '28088630', '0', '369000', '27719630'],
        ['شرکت داروسازان التیام', '14010301', '322', '28521332', '0', '2116390', '26404942'],
        ['بهستان پخش', '14010302', '23406', '41814736', '0', '0', '41814736']
    ]

    load_data_table(tmp);

    function load_data_table(data) {
        for (var i = 0; i < data.length; i++) {
            $("#fac_tbl > tbody").append($('<tr></tr>').attr('id', 'row-' + i));
            for (let j = 0; j < data[i].length; j++) {
                $('#row-' + i).append($("<td></td>").text((j > 2) ?
                    comify(data[i][j]) :
                    data[i][j]))
            }
        }
    }

    function comify(input) {
        return input.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
});