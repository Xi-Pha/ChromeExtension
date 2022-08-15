document.addEventListener('DOMContentLoaded', (event) => {
    let database_button = document.getElementById('database_btn');
    let factor_button = document.getElementById('factor');
    let define_button = document.getElementById('define');

    
    database_button.addEventListener("click", async () => {
        window.open('database.html','_blank');
    });

    factor_button.addEventListener("click", async () => {
        window.open('factor.html','_blank');
    });

    define_button.addEventListener("click", async () => {
        window.open('define.html','_blank');
    });

    $('#navigation').load("../navbar.html");

}); 


