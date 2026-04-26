const carro = document.querySelector("#carro");
const camera = document.querySelector("#camera");


// parar
let velocidade = 0;
let angulo = 0;
const aceleracao = 0.015;
const forcaGiro = 2.0;
const atrito = 0.96; 

const teclas = {};

// monitorar as teclas
document.addEventListener("keydown", (e) => teclas[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => teclas[e.key.toLowerCase()] = false);

function atualizar() {
    // entrada (botoẽs)
    if (teclas['w']) velocidade -= aceleracao; //frente
    if (teclas['s']) velocidade += aceleracao; //trás 
    
    // girar o carro 
    if (Math.abs(velocidade) > 0.001) {
        if (teclas['a']) angulo += forcaGiro;
        if (teclas['d']) angulo -= forcaGiro;
    }

    // atrito
    velocidade *= atrito;

    // posição atual
    let pos = carro.getAttribute("position");

    // cálculo de direção (conversão de grau por radiano)
    let rad = angulo * (Math.PI / 180);

    // X e Z baseados no ângulo
    pos.x += Math.sin(rad) * velocidade;
    pos.z += Math.cos(rad) * velocidade;

    // aplica as novas transformações ao carro
    carro.setAttribute("position", pos);
    carro.setAttribute("rotation", { x: 0, y: angulo, z: 0 });

    // câmera seguindo o carro
    camera.setAttribute("position", {
        x: pos.x,
        y: 6,
        z: pos.z + 12
    });

    requestAnimationFrame(atualizar);
}

// inicia
atualizar();
