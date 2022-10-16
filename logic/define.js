document.addEventListener('DOMContentLoaded', (event) => {
    $('#navigation').load("../navbar.html");
    $('#gtn_input').keyup(function(e) {
        if (e.keyCode === 13) {
            $('#count_input').focus();
        }
    });
    $('#count_input').keyup(function(e) {
        if (e.keyCode === 13) {
            $('#price_input').focus();
        }
    });
    $('#price_input').keyup(function(e) {
        if (e.keyCode === 13) {
            $('#price_input').val(calc($('#price_input').val()));
            $('#gtn_input').focus();
        }
    });



    function calc(input) {
        if (input.includes("/")) {
            var arr = input.split("/");
            var res = arr[0]/arr[1];
            return (Math.floor(res) === res) ? res : Math.floor(res)+1;
        }
        return input;
    }
}); 

