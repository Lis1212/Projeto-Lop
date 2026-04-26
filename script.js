window.addEventListener("DOMContentLoaded", () => {
    
const carro = document.querySelector("#carro");
const cameraRig = document.querySelector("#cameraRig");

let velocidade = 0;
let angulo = 0;
const aceleracao = 0.015;
const forcaGiro = 2.0;


const teclas = {};

// teclado
document.addEventListener("keydown", (e) => teclas[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => teclas[e.key.toLowerCase()] = false);

// controle
function segurar(botao, tecla) {
    const car = document.querySelector(botao);
    if (!car) return;

    car.addEventListener("touchstart", () => teclas[tecla] = true);
    car.addEventListener("touchend", () => teclas[tecla] = false);
    car.addEventListener("mousedown", () => teclas[tecla] = true);
    car.addEventListener("mouseup", () => teclas[tecla] = false);
}

segurar("#btFrente", "w");
segurar("#btTras", "s");
segurar("#btEsquerda", "a");
segurar("#btDireita", "d");



function atualizar() {
    // movimento
    if (teclas['w']) velocidade += aceleracao;
    if (teclas['s']) velocidade -= aceleracao;

    if (Math.abs(velocidade) > 0.001) {
        if (teclas['a']) angulo += forcaGiro;
        if (teclas['d']) angulo -= forcaGiro;
    }

    velocidade *= 0.97;
    velocidade = Math.max(-0.2, Math.min(0.2, velocidade));

    // posição
    let pos = carro.getAttribute("position");
    pos = { ...pos };

    let rad = angulo * (Math.PI / 180);

    pos.x += Math.sin(rad) * velocidade;
    pos.z += Math.cos(rad) * velocidade;

    pos.x += Math.sin(rad) * direcao;
    pos.z += Math.cos(rad) * direcao;

    // cenário 

    if (pos.x > 5) pos.x = -5;
    if (pos.x < -5) pos.x = 5;
    if (pos.z > 5) pos.z = -5;
    if (pos.z < -5) pos.z = 5;

    // aplica carro
    carro.setAttribute("position", pos);
    carro.setAttribute("rotation", `0 ${angulo} 0`);



    // Câmera 
    cameraRig.setAttribute("position", {
        x: pos.x,
        y: 6,
        z: pos.z + 12
    });


    requestAnimationFrame(atualizar);
}

// incia
atualizar();
    
});
