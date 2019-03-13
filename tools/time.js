
//@return 17_08_2018  (used for CREATE TABLE 'name')
function today(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var min = today.getMinutes();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = yyyy + "_" + mm + "_" + dd + "at" + hour + "_" + min;
    return today;  
}

module.exports.today = today;