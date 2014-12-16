/**
 * Created by ashi on 2014-12-09.
 */

var gl;
var glExt;

function init() {
    var canvas = document.getElementById("beerCanvas");
    BeerApp.init(canvas);
}

function run() {
    BeerApp.run();
}

onload = function () {
    init();
    run();
};
