/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function Slider(id) {
    var __ = this;
    var elem = document.getElementById(id);
    
    elem.addEventListener('change', change, false);
    elem.addEventListener('input', input, false);
    
    function input(evt) {
        var val = evt.target.valueAsNumber;
        if(__.onInput && __.onInput !== null) {
            __.onInput(val);
        }
    } 
    
    function change(evt) {
        var val = evt.target.valueAsNumber;
        if(__.onChange && __.onChange !== null) {
            __.onChange(val);
        }
    }
    
    __.onInput = null;
    __.onChange = null;
    
//    __.onChange = function() {
//        return new Promise(function(fullfill, reject) {
//            fullfill(evt);
//        });
//    };
    
    return __;
}