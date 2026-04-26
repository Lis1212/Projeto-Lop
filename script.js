const carro = document.querySelector("#carro");
const cameraRig = document.querySelector("#cameraRig");

let velocidade = 0;
let angulo = 0;
const aceleracao = 0.015;
const forcaGiro = 2.0;
const atrito = 0.96; // parar

const teclas = {};

// monitoramento de teclas
document.addEventListener("keydown", (e) => teclas[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => teclas[e.key.toLowerCase()] = false);

// controle 
function segurar(botao, tecla) {
    const el = document.querySelector(botao);

    el.addEventListener("touchstart", () => teclas[tecla] = true);
    el.addEventListener("touchend", () => teclas[tecla] = false);

    el.addEventListener("mousedown", () => teclas[tecla] = true);
    el.addEventListener("mouseup", () => teclas[tecla] = false);
}

// direção carro
    segurar("#btFrente", "w");
    segurar("#btTras", "s");
    segurar("#btEsquerda", "a");
    segurar("#btDireita", "d");


function atualizar() {
    // lógica de entrada
    if (teclas['w']) velocidade += aceleracao; // frente
    if (teclas['s']) velocidade -= aceleracao; // trás 
    
    // gira o carro
    if (Math.abs(velocidade) > 0.001) {
        if (teclas['a']) angulo += forcaGiro;
        if (teclas['d']) angulo -= forcaGiro;
    }

    // atrito
    velocidade *= 0.97;
    velocidade = Math.max(-0.2, Math.min(0.2, velocidade));

    // posição atual
    let pos = carro.getAttribute("position");

    // cálculo de direção (convertido de graus lara medianos)
    let rad = angulo * (Math.PI / 180);

    // Atualiza X e Z baseados no ângulo
    const direcao = velocidade;

    pos.x += Math.sin(rad) * direcao;
    pos.z += Math.cos(rad) * direcao;

    // aplica as novas transformações ao carro
    carro.setAttribute("position", pos);
    carro.setAttribute("rotation", { x: 0, y: angulo, z: 0 });

    // cenário 

    if (pos.x > 5) {
    pos.x = -5;
}

    if (pos.x < -5) {
    pos.x = 5;
}

    if (pos.z > 5) {
    pos.z = -5;
}

    if (pos.z < -5) {
    pos.z = 5;
}



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
