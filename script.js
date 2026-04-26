const carro = document.querySelector("#carro");
const cameraRig = document.querySelector("#camera");

document.addEventListener("keydown", function(e){

let pos = carro.getAttribute("position");

// frente
if(e.key === "w"){
    pos.z -= 1;
}

// tras
if(e.key === "s"){
    pos.z += 1;
}

// esquerda
if(e.key === "a"){
    pos.x -= 0.8;
}

// direita
if(e.key === "d"){
    pos.x += 0.8;
}

carro.setAttribute("position", pos);

});

/* câmera */
function atualizarCamera(){

let pos = carro.getAttribute("position");

cameraRig.setAttribute("position", {
x: pos.x,
y: 6,
z: pos.z + 14
});

cameraRig.setAttribute("rotation", {
x: 0,
y: 0,
z: 0
});

requestAnimationFrame(atualizarCamera);

}

atualizarCamera();