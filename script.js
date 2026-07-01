const cena = document.querySelector("a-scene");
cena.addEventListener("loaded", iniciarJogo);

function iniciarJogo() {

 
  const cameraRig       = document.querySelector("#camera-rig");
  
  
  const ceu             = document.querySelector("#ceu");
  const luzAmbiente     = document.querySelector("#luz-ambiente");
  const luzDirecional   = document.querySelector("#luz-direcional");
  const contObst        = document.querySelector("#obstaculos");
  const contChuva       = document.querySelector("#chuva");
  const contChao        = document.querySelector("#chao-container");
  const contDeco        = document.querySelector("#decoracao");

  const telaInicio      = document.querySelector("#tela-inicio");
  const telaGameover    = document.querySelector("#tela-gameover");
  const hud             = document.querySelector("#hud");
  const flashDano       = document.querySelector("#flash-dano");
  const setaEsq         = document.querySelector("#seta-esq");
  const setaDir         = document.querySelector("#seta-dir");
  const hudDist         = document.querySelector("#hud-dist");
  const hudVidas        = document.querySelector("#hud-vidas");
  const hudRec          = document.querySelector("#hud-rec");
  const hudPeriodo      = document.querySelector("#hud-periodo");
  const goDistEl        = document.querySelector("#go-dist");
  const goRecEl         = document.querySelector("#go-rec");
  const novoRecEl       = document.querySelector("#novo-recorde");
  const recordeInicioEl = document.querySelector("#recorde-inicio");
  const btnIniciar      = document.querySelector("#btn-iniciar");
  const btnReiniciar    = document.querySelector("#btn-reiniciar");

  // ── estado 
  
  const VIDAS_MAX      = 3;
  let emJogo           = false;
  let invencivel       = false;
  let velocidadeMundo  = 0;
  let posX             = 0;
  let distancia        = 0;
  let vidas            = VIDAS_MAX;
  let recorde          = parseInt(localStorage.getItem("driftrun-recorde") || "0");
  let loopId           = null;
  let intervaloObst    = 3.0;
  let timerObst        = 0;
  const obstaculos     = [];

  // ciclo do dia
  const periodos = [
    { nome: "🌅 Dia",        ceu: "#87CEEB", amb: 0.8,  dir: 1.0,  dirCor: "#fff9e0" },
    { nome: "🌇 Entardecer", ceu: "#FF7043", amb: 0.5,  dir: 0.6,  dirCor: "#ffaa44" },
    { nome: "🌙 Noite",      ceu: "#0a0a2e", amb: 0.15, dir: 0.1,  dirCor: "#3344aa" },
    { nome: "🌧️ Chuva",      ceu: "#1a1a2e", amb: 0.1,  dir: 0.08, dirCor: "#223355" },
  ];
  let periodoAtual  = 0;
  let tPeriodo      = 0;
  const DUR_PERIODO = 30;

  const gotas     = [];
  let chuvaAtiva  = false;

  recordeInicioEl.textContent = recorde;

  const teclas = {};
  document.addEventListener("keydown", (e) => {
    if (emJogo) teclas[e.key] = true;
  });
  document.addEventListener("keyup", (e) => {
    teclas[e.key] = false;
  });

  btnIniciar.addEventListener("click",   comecarJogo);
  btnReiniciar.addEventListener("click", comecarJogo);

  
  //  chão infinito
 
  const SEG_COMP = 40;
  const NUM_SEGS = 8;
  const segs     = [];

  for (let i = 0; i < NUM_SEGS; i++) {
    const s = document.createElement("a-plane");
    s.setAttribute("color",    "#5a8a3a");
    s.setAttribute("rotation", "-90 0 0");
    s.setAttribute("width",    "200");
    s.setAttribute("height",   String(SEG_COMP));
    s.setAttribute("position", `0 0 ${-(i * SEG_COMP)}`);
    contChao.appendChild(s);
    segs.push(s);
  }

  
  //  horizonte
  
  const montanhas = [
    // camada traseira (mais alta, mais escura)
    { x: -80, z: -200, sc: "30 50 20", cor: "#2d4a28", id: "m1" },
    { x: -30, z: -220, sc: "25 40 20", cor: "#263d22", id: "m2" },
    { x:  20, z: -210, sc: "35 55 20", cor: "#2d4a28", id: "m3" },
    { x:  80, z: -200, sc: "28 45 20", cor: "#263d22", id: "m4" },
    // camada da frente (menor, mais clara)
    { x: -55, z: -130, sc: "18 28 15", cor: "#4a6741", id: "m5" },
    { x:  10, z: -140, sc: "22 32 15", cor: "#3d5c38", id: "m6" },
    { x:  60, z: -125, sc: "16 24 15", cor: "#4a6741", id: "m7" },
  ];

  montanhas.forEach(m => {
    const cone = document.createElement("a-cone");
    cone.setAttribute("position",     `${m.x} 0 ${m.z}`);
    cone.setAttribute("scale",        m.sc);
    cone.setAttribute("color",        m.cor);
    cone.setAttribute("radius-bottom","1");
    cone.setAttribute("radius-top",   "0");
    cone.setAttribute("id",           m.id);
    contDeco.appendChild(cone);
  });

  // Estrelas (bolinhas brancas, visíveis só à noite via opacidade)
  const estrelas = [];
  for (let i = 0; i < 80; i++) {
    const est = document.createElement("a-sphere");
    est.setAttribute("radius",   "0.15");
    est.setAttribute("color",    "#ffffff");
    est.setAttribute("opacity",  "0");
    est.setAttribute("position", `${(Math.random()-0.5)*300} ${30+Math.random()*40} ${-(50+Math.random()*200)}`);
    contDeco.appendChild(est);
    estrelas.push(est);
  }

  // luzes no horizonte 
  const luzesCidade = [];
  for (let i = 0; i < 25; i++) {
    const luz = document.createElement("a-sphere");
    const cores = ["#ffdd00","#ff4400","#ffffff","#00aaff","#ff0088"];
    luz.setAttribute("radius",   "0.3");
    luz.setAttribute("color",    cores[Math.floor(Math.random()*cores.length)]);
    luz.setAttribute("opacity",  "0");
    luz.setAttribute("position", `${(Math.random()-0.5)*160} ${0.3+Math.random()*4} -180`);
    contDeco.appendChild(luz);
    luzesCidade.push(luz);
  }

 
  //  chuva
  
  for (let i = 0; i < 200; i++) {
    const gota = document.createElement("a-cylinder");
    gota.setAttribute("radius",   "0.02");
    gota.setAttribute("height",   "0.5");
    gota.setAttribute("color",    "#aaccff");
    gota.setAttribute("opacity",  "0.45");
    gota.setAttribute("position", `${(Math.random()-0.5)*60} ${10+Math.random()*10} ${-(Math.random()*80)}`);
    gota.setAttribute("visible",  "false");
    contChuva.appendChild(gota);
    gotas.push({ el: gota });
  }

 
  //  obstáculos

  const TIPOS = ["pedra", "cone", "arvore", "barril"];

  function criarObstaculoEl(tipo) {
    const wrapper = document.createElement("a-entity");

    if (tipo === "pedra") {
      const el = document.createElement("a-sphere");
      el.setAttribute("radius",    "1.1");   // era 0.6
      el.setAttribute("color",     "#777");
      el.setAttribute("roughness", "1");
      wrapper.appendChild(el);

    } else if (tipo === "cone") {
      const el = document.createElement("a-cone");
      el.setAttribute("radius-bottom", "0.7");  // era 0.35
      el.setAttribute("radius-top",    "0.05");
      el.setAttribute("height",        "2.2");  // era 1.1
      el.setAttribute("color",         "#ff6600");
      wrapper.appendChild(el);

    } else if (tipo === "arvore") {
      const tronco = document.createElement("a-cylinder");
      tronco.setAttribute("radius",   "0.35");
      tronco.setAttribute("height",   "3.5");
      tronco.setAttribute("color",    "#6B3A2A");
      tronco.setAttribute("position", "0 1.75 0");
      const copa = document.createElement("a-sphere");
      copa.setAttribute("radius",   "1.8");
      copa.setAttribute("color",    "#2d6a2d");
      copa.setAttribute("position", "0 4.5 0");
      wrapper.appendChild(tronco);
      wrapper.appendChild(copa);

    } else if (tipo === "barril") {
      const el = document.createElement("a-cylinder");
      el.setAttribute("radius", "0.65");  // era 0.35
      el.setAttribute("height", "1.6");   // era 0.9
      el.setAttribute("color",  "#8B4513");
      wrapper.appendChild(el);
    }

    return wrapper;
  }

  for (let i = 0; i < 20; i++) {
    const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    const el   = criarObstaculoEl(tipo);
    el.setAttribute("position", "0 0 -999");
    el.setAttribute("visible",  "false");
    contObst.appendChild(el);
    obstaculos.push({ el, ativo: false });
  }

  function spawnObstaculo() {
    const obst = obstaculos.find(o => !o.ativo);
    if (!obst) return;
    const x = (Math.random() - 0.5) * 30;
    obst.el.setAttribute("position", `${x} 1.1 -80`);
    obst.el.setAttribute("visible",  "true");
    obst.ativo = true;
  }



    

  function atualizarHudVidas() {
    hudVidas.textContent = "❤️".repeat(vidas) + "🖤".repeat(VIDAS_MAX - vidas);
  }

  function dispararFlash() {
    flashDano.classList.add("ativo");
    setTimeout(() => flashDano.classList.remove("ativo"), 200);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function hexParaRgb(hex) {
    return {
      r: parseInt(hex.slice(1,3), 16),
      g: parseInt(hex.slice(3,5), 16),
      b: parseInt(hex.slice(5,7), 16),
    };
  }

  function rgbParaHex({ r, g, b }) {
    return "#" + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,"0")).join("");
  }

  function lerpCor(hexA, hexB, t) {
    const a = hexParaRgb(hexA), b = hexParaRgb(hexB);
    return rgbParaHex({ r: lerp(a.r,b.r,t), g: lerp(a.g,b.g,t), b: lerp(a.b,b.b,t) });
  }

  function mostrarSetas(mostrar) {
    const disp = mostrar ? "flex" : "none";
    setaEsq.style.display = disp;
    setaDir.style.display = disp;
  }

 
  //  estado (controle)
 
  function comecarJogo() {
    posX             = 0;
    distancia        = 0;
    vidas            = VIDAS_MAX;
    velocidadeMundo  = 0.08;
    invencivel       = false;
    periodoAtual     = 0;
    tPeriodo         = 0;
    timerObst        = 0;
    intervaloObst    = 3.0;
    chuvaAtiva       = false;

    obstaculos.forEach(o => {
      o.el.setAttribute("position", "0 0 -999");
      o.el.setAttribute("visible",  "false");
      o.ativo = false;
    });
    gotas.forEach(g => g.el.setAttribute("visible", "false"));

    // Reseta decoração noturna
    estrelas.forEach(e => e.setAttribute("opacity", "0"));
    luzesCidade.forEach(l => l.setAttribute("opacity", "0"));

    aplicarPeriodo(periodos[0]);
    atualizarHudVidas();
    hudPeriodo.textContent   = periodos[0].nome;
    hudPeriodo.style.opacity = "1";

    telaInicio.style.display   = "none";
    telaGameover.style.display = "none";
    hud.style.display          = "block";
    mostrarSetas(true);

    emJogo = true;
    let ultimo = performance.now();
    if (loopId) cancelAnimationFrame(loopId);

    function loop(agora) {
      if (!emJogo) return;
      const dt = Math.min((agora - ultimo) / 1000, 0.05);
      ultimo = agora;
      tick(dt);
      loopId = requestAnimationFrame(loop);
    }
    loopId = requestAnimationFrame(loop);
  }

  function perderVida() {
    if (invencivel) return;
    vidas--;
    atualizarHudVidas();
    dispararFlash();
    if (vidas <= 0) { gameOver(); return; }
    invencivel = true;
    setTimeout(() => { invencivel = false; }, 1800);
  }

  function gameOver() {
    emJogo = false;
    mostrarSetas(false);
    const dist = Math.round(distancia);
    goDistEl.textContent = dist;

    if (dist > recorde) {
      recorde = dist;
      localStorage.setItem("driftrun-recorde", recorde);
      novoRecEl.style.display = "block";
    } else {
      novoRecEl.style.display = "none";
    }

    goRecEl.textContent         = recorde;
    recordeInicioEl.textContent = recorde;
    hud.style.display           = "none";
    telaGameover.style.display  = "flex";
  }

  function aplicarPeriodo(p) {
    ceu.setAttribute("color",                  p.ceu);
    luzAmbiente.setAttribute("intensity",      String(p.amb));
    luzDirecional.setAttribute("intensity",    String(p.dir));
    luzDirecional.setAttribute("color",        p.dirCor);
  }


  //  TICK

  function tick(dt) {

    velocidadeMundo = Math.min(velocidadeMundo + 0.0001 * dt * 60, 0.45);
    distancia      += velocidadeMundo * dt * 60;

    //  lateral 
    const VEL_LATERAL = 6.0;
    const LIMITE_X    = 20;
    const movEsq = teclas["a"] || teclas["ArrowLeft"];
    const movDir = teclas["d"] || teclas["ArrowRight"];

    if (movEsq) posX = Math.max(posX - VEL_LATERAL * dt, -LIMITE_X);
    if (movDir) posX = Math.min(posX + VEL_LATERAL * dt,  LIMITE_X);

    // ilumina seta correspondente
    setaEsq.classList.toggle("ativa", !!movEsq);
    setaDir.classList.toggle("ativa", !!movDir);

    
    
    
    
    
    cameraRig.setAttribute("position", { x: posX, y: 1.6, z: 0 });

    // chão infinito 
    
    const velChao = velocidadeMundo * dt * 60;
    segs.forEach(s => {
      const p = s.getAttribute("position");
      p.z += velChao;
      if (p.z > SEG_COMP) p.z -= NUM_SEGS * SEG_COMP;
      s.setAttribute("position", p);
    });

    // ── Obstáculos 
    timerObst += dt;
    if (timerObst >= intervaloObst) {
      timerObst     = 0;
      intervaloObst = Math.max(0.9, intervaloObst - 0.05);
      spawnObstaculo();
    }

    obstaculos.forEach(o => {
      if (!o.ativo) return;
      const p = o.el.getAttribute("position");
      p.z += velChao * 1.1;

      if (p.z > 5) {
        o.el.setAttribute("position", "0 0 -999");
        o.el.setAttribute("visible",  "false");
        o.ativo = false;
        return;
      }

      o.el.setAttribute("position", p);

      // Colisão
      if (!invencivel && p.z > -4 && p.z < 2) {
        const dx = posX - p.x;
        if (Math.abs(dx) < 2.0) {  // raio maior pro obstáculo maior
          perderVida();
          o.el.setAttribute("position", "0 0 -999");
          o.el.setAttribute("visible",  "false");
          o.ativo = false;
        }
      }
    });

    // ── Ciclo dia/noite ───────────────────────────────────────
    tPeriodo += dt;
    const t = Math.min(tPeriodo / DUR_PERIODO, 1);
    const pAtual = periodos[periodoAtual];
    const pProx  = periodos[Math.min(periodoAtual + 1, periodos.length - 1)];
    ceu.setAttribute("color", lerpCor(pAtual.ceu, pProx.ceu, t));

    // Estrelas e luzes 
    if (periodoAtual >= 2) {
      const opEst = Math.min(t * 1.5, 0.9);
      const opLuz = Math.min(t * 2, 1.0);
      estrelas.forEach(e => e.setAttribute("opacity", String(opEst)));
      luzesCidade.forEach(l => l.setAttribute("opacity", String(opLuz)));
    }

    if (tPeriodo >= DUR_PERIODO && periodoAtual < periodos.length - 1) {
      periodoAtual++;
      tPeriodo = 0;
      aplicarPeriodo(periodos[periodoAtual]);
      hudPeriodo.textContent   = periodos[periodoAtual].nome;
      hudPeriodo.style.opacity = "1";
      setTimeout(() => { hudPeriodo.style.opacity = "0"; }, 3000);

      if (periodoAtual === 3) {
        chuvaAtiva = true;
        gotas.forEach(g => g.el.setAttribute("visible", "true"));
      }
    }

    // ── Chuva ─────────────────────────────────────────────────
    if (chuvaAtiva) {
      gotas.forEach(g => {
        const p = g.el.getAttribute("position");
        p.y -= 12 * dt;
        p.z += velChao * 0.5;
        if (p.y < -1) {
          p.y = 10 + Math.random() * 10;
          p.x = posX + (Math.random() - 0.5) * 60;
          p.z = -(Math.random() * 80);
        }
        g.el.setAttribute("position", p);
      });
    }

    // ── HUD ───────────────────────────────────────────────────
    hudDist.textContent = Math.round(distancia);
    hudRec.textContent  = Math.max(Math.round(distancia), recorde);
  }
}
