// Vertex shader
let VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal;

  attribute vec2 a_TexCoords;

  uniform mat4 u_MvpMatrix;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  
  uniform vec3 u_LightColor;
  uniform vec3 u_LightPosition;

  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec2 v_TexCoords;
  varying vec3 v_Position;

  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Position = vec3(u_ModelMatrix * a_Position);
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    v_Color = a_Color;
    v_TexCoords = a_TexCoords;
  }
`;

// Fragment shader
let FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform bool u_UseTextures;
  uniform bool u_tvLight;   
  uniform vec3 u_LightColor;     
  uniform vec3 u_LightPosition;  
  uniform vec3 u_AmbientLight;   
  uniform vec3 u_EyePosition;    
  uniform sampler2D u_Sampler;
  
  varying vec3 v_Normal;
  varying vec3 v_Position;
  varying vec4 v_Color;
  varying vec2 v_TexCoords;
  
  void main() {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(u_LightPosition - v_Position); 
    float nDotL = max(dot(lightDirection, normal), 0.0); 
    
    vec3 diffuse;
    vec3 tvDiffuse;
    if (u_UseTextures) {
       vec4 TexColor = texture2D(u_Sampler, v_TexCoords);
       diffuse = u_LightColor * TexColor.rgb * nDotL;
    } else {
       diffuse = u_LightColor * v_Color.rgb * nDotL;
    }
    if (u_tvLight) {
    vec3 TVLightDirection = normalize(normalize(vec3(12, 5.0, -5.0)) - v_Position);
    float TVnDotL = max(dot(TVLightDirection, normal), 0.0);
    float intensityFactor = 5.0;
    tvDiffuse = v_Color.rgb * TVnDotL * normalize(vec3(0.0, 0.35, 0.8)) * intensityFactor;
    }
    
    vec3 viewDirection = normalize(u_EyePosition - v_Position);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float shininess = 10.0;  // Shininess coefficient for Phong lighting
    float specularStrength = 0.005;  // Specular intensity
    float specularFactor = pow(max(dot(viewDirection, reflectionDirection), 0.0), shininess);
    vec3 specular = u_LightColor * specularFactor * specularStrength;

    vec3 ambient = u_AmbientLight * v_Color.rgb; // Ambient light

    gl_FragColor = vec4(diffuse + ambient + specular + tvDiffuse, v_Color.a);
  }
`;

let ANGLE_STEP = 1.0;
let rotationAngle = 0.0;
let shiftChair = 0.0;
let tvLight = false;
let open = 0;

function moveForward(viewProjMatrix){
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.0,0.0, 1, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
}
function moveBackward(viewProjMatrix){
    viewProjMatrix.lookAt(0.0,0.0, 1, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
}
function tiltUp(viewProjMatrix){
    viewProjMatrix.lookAt(0.0,0.05, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
}
function tiltDown(viewProjMatrix){
    viewProjMatrix.lookAt(0.0,-0.05, 1, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.0,0.0, 1, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
}
function keydown(ev, gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_tvLight, u_UseTextures, ) {
  let n = buffers.indices.length;
  switch (ev.keyCode) {
    case 49: // 1
      if (shiftChair < 3){
          shiftChair += 0.1;
      }
      break;
    case 50: // 2
      if (shiftChair > 0.2){
          shiftChair -= 0.1;
      }
      break;
    case 87: // W
      tiltUp(viewProjMatrix)
      break
    case 83: // S
      tiltDown(viewProjMatrix)
      break
    case 40: // ↓
      moveBackward(viewProjMatrix)
      break;
    case 38: // ↑
      moveForward(viewProjMatrix)
      break;
    case 39: // →
      rotationAngle -= ANGLE_STEP*2;
      break;
    case 37: // ←
      rotationAngle += ANGLE_STEP*2;
      break;
    case 79: // O
        if(open == 0){
          open = 1;
        }
        else{
          open = 0;
        }
      break;
    case 84: // T
    if (tvLight) {
      gl.uniform1i(u_tvLight, false);
      tvLight = false;
    } else {
      gl.uniform1i(u_tvLight, true);
      tvLight = true;
    }
  }
}
function initVertexBuffers(gl) {
  // Coordenadas (cubo com comprimento de um lado igual 1 com a origem no centro da parte inferior)
  let vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 frente
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 direita
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 cima
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 esquerda
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 baixo
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 atrás
  ]);

  let texCoords = new Float32Array([
    1.0, 0.0,    0.0, 0.0,   0.0, 1.0,   1.0, 1.0,  
    1.0, 0.0,    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,  
    1.0, 1.0,    1.0, 0.0,   0.0, 0.0,   0.0, 1.0,  
    1.0, 0.0,    0.0, 0.0,   0.0, 1.0,   1.0, 1.0,  
    0.0, 1.0,    1.0, 1.0,   1.0, 0.0,   0.0, 0.0,  
    0.0, 1.0,    1.0, 1.0,   1.0, 0.0,   0.0, 0.0   
  ]);

  let texCoordsFloor = new Float32Array([
    5.0, 0.0,    0.0, 0.0,   0.0, 5.0,   5.0, 5.0, 
    5.0, 0.0,    5.0, 5.0,   0.0, 5.0,   0.0, 0.0,  
    5.0, 5.0,    5.0, 0.0,   0.0, 0.0,   0.0, 5.0,  
    5.0, 0.0,    0.0, 0.0,   0.0, 5.0,   5.0, 5.0,  
    0.0, 5.0,    5.0, 5.0,   5.0, 0.0,   0.0, 0.0,  
    0.0, 5.0,    5.0, 5.0,   5.0, 0.0,   0.0, 0.0   
  ]);

  // Normal
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  let normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, 
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, 
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, 
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, 
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  // Índices dos vértices
  let indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // frente
     4, 5, 6,   4, 6, 7,    // direita
     8, 9,10,   8,10,11,    // cima
    12,13,14,  12,14,15,    // esquerda
    16,17,18,  16,18,19,    // baixo
    20,21,22,  20,22,23     // atrás
  ]);


  // Escreve vertices nos buffers (coordenadas e normais)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;

  // Desvincula o objeto buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Escreve os índices no objeto buffer
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return {
      position: vertices,
      normal: normals,
      texCoords: texCoords,
      texCoordsFloor: texCoordsFloor,
      indices: indices
  }
}
function initArrayBuffer(gl, attribute, data, num) {
  // Cria um objeto buffer
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Escreve dados no objeto buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Tamanho do elemento
  let FSIZE = data.BYTES_PER_ELEMENT;

  // Atribui o objeto buffer à variável de atributo
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, FSIZE * num, 0);
  // Habilita a atribuição do objeto buffer à variável de atributo
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

// Matriz de transformação de coordenadas
let g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function main() {
  // Recupera o elemento <canvas> do DOM
  let canvas = document.getElementById('webgl');

  // Obtém o contexto de renderização para WebGL
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Inicializa os shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Define as informações dos vértices
  let buffers = initVertexBuffers(gl)
  let n = buffers.indices.length;
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Define a cor de limpeza e habilita o teste de profundidade
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);

  // Armazenamento das variáveis uniformes
  let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  let u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  let u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) {
    console.log('Failed to get the storage location');
    return;
  }
  let u_tvLight = gl.getUniformLocation(gl.program, "u_tvLight");
  let u_UseTextures = gl.getUniformLocation(gl.program, "u_UseTextures");
  if (!u_tvLight) {
    console.log('Failed to get the storage location for tv light flag');
    return;
  }

  let modelMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // cor da luz (branca)
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // posição da luz (em coordenadas do mundo)
  gl.uniform3f(u_LightPosition, 2.0, 1.5, 0);
  // luz ambiente
  gl.uniform3f(u_AmbientLight, 0.01, 0.01, 0.01);

  // Calcula matriz de projeção da câmera
  let viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 200.0); // perspectiva
  viewProjMatrix.lookAt(0.0, 20.0, 50.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0); // posição da câmera

  gl.uniform1i(u_UseTextures, false);

  // Função de callback para o evento de tecla pressionada
  document.onkeydown = function(ev){ keydown(ev, gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_tvLight, u_UseTextures, u_LightPosition); };
  
  drawScene(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, open, u_LightPosition);
  
  let lightDirection = 1.0;
  let lightPositionX = 2.0; 

  function animate() {
    lightPositionX += 0.1 * lightDirection;
    
    if (lightPositionX > 2 || lightPositionX < -2.0) {
      lightDirection *= -1;
    }
    gl.uniform3f(u_LightPosition, lightPositionX,  1.5, 0);

    drawScene(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, open);

    requestAnimationFrame(animate);
  }

  animate()
}

function drawScene(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, open,) {
  // Limpa o buffer de cor e de profundidade
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawWalls(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 7.0, 0.0, 0.0,rotationAngle+0.0, u_UseTextures);
  
  drawRoundTable(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -4.0, 0.0, -4.0, rotationAngle);
  drawPaintings(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, -17.1, rotationAngle);
  drawPlant(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 12.0, 0.0, -15.0, rotationAngle);
  drawPlant(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -17.3, 0.0, 8.0, rotationAngle);
  
  drawSofa(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -17.3, 0.0, -3.8,rotationAngle+0.0, u_UseTextures);
  drawSofa(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -14.0, 0.0, 7.25,rotationAngle-90, u_UseTextures);
  drawSofaSmall(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -14,0,-3.6,rotationAngle-90, u_UseTextures);
  drawTable(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 5, 0.0, 13.0,rotationAngle, u_UseTextures);
  drawChair(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 12.5, 0.0, -8.0,rotationAngle-90.0, u_UseTextures, shiftChair);
  drawChair(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 12.5, 0.0, -12.0,rotationAngle-90.0, u_UseTextures, shiftChair);
  drawChair(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -17.5, 0.0, +6.0,rotationAngle+90.0, u_UseTextures, shiftChair);
  drawChair(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -17.5, 0.0, +10.0,rotationAngle+90.0, u_UseTextures, shiftChair);
  drawTeapoy(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -2.4, 0, -21, rotationAngle+45, u_UseTextures);
  drawTVStand(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 4, 0, 15, rotationAngle+90, u_UseTextures)
  drawTV(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 15, 1.7, -4,rotationAngle+0, u_UseTextures);
  drawShelf(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -16, 0.0, -17,rotationAngle+90.0, u_UseTextures, open);
  drawMat(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -4.2, 0, -4.2, rotationAngle, u_UseTextures);

}

function drawRoundTable(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
    // Base da perna
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x, y, z);
    g_modelMatrix.scale(2.5, 0.3, 2.5);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.2, 0.2, 0.2);

    // Tronco central
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x, y + 0.3, z);
    g_modelMatrix.scale(0.8, 1.8, 0.8);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.1, 0.1, 0.1);

    // Tampo (Vários cubos cruzados para formar o círculo de vidro)
    let numSegments = 16;
    for(let i=0; i<numSegments; i++) {
        g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
        g_modelMatrix.translate(x, y + 2.1, z);
        g_modelMatrix.rotate((i * 180 / numSegments), 0.0, 1.0, 0.0);
        g_modelMatrix.scale(6.5, 0.2, 6.5);
        // Cor simulando espelho/vidro (Azul bem claro)
        drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.7, 0.85, 0.95);
    }
}

function drawPaintings(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
    // Quadro 1 (Esquerda)
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x - 12.0, y + 8.0, z);
    g_modelMatrix.scale(6.0, 4.0, 0.2);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.1, 0.1, 0.1); // Moldura
    
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x - 12.0, y + 8.0, z + 0.15);
    g_modelMatrix.scale(5.5, 3.5, 0.2);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.8, 0.8, 0.85); // Arte (Branca)

    // Quadro 2 (Meio)
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x - 4.0, y + 8.0, z);
    g_modelMatrix.scale(4.0, 5.0, 0.2);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.4, 0.2, 0.1); // Moldura
    
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x - 4.0, y + 8.0, z + 0.15);
    g_modelMatrix.scale(3.5, 4.5, 0.2);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.2, 0.6, 0.4); // Arte (Verde escuro)
    
    // Quadro 3 (Direita)
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x + 3.0, y + 8.0, z);
    g_modelMatrix.scale(4.0, 4.0, 0.2);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.1, 0.1, 0.1); // Moldura
    
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x + 3.0, y + 8.0, z + 0.15);
    g_modelMatrix.scale(3.5, 3.5, 0.2);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.9, 0.3, 0.2); // Arte (Vermelha)
}

function drawPlant(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
    // Vaso (Marrom cerâmica)
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x, y, z);
    g_modelMatrix.scale(2.5, 2.0, 2.5);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.7, 0.3, 0.1); 
    
    // Tronco
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x, y + 2.0, z);
    g_modelMatrix.scale(0.4, 5.0, 0.4);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.3, 0.2, 0.1);
    
    // Folhas (Camadas cruzadas para simular volume Low-Poly)
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x, y + 5.0, z);
    g_modelMatrix.scale(3.5, 2.0, 3.5);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.1, 0.5, 0.2);

    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x, y + 6.0, z);
    g_modelMatrix.rotate(45, 0, 1, 0);
    g_modelMatrix.scale(2.8, 2.0, 2.8);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.15, 0.6, 0.25);
    
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x, y + 7.0, z);
    g_modelMatrix.rotate(25, 0, 1, 0);
    g_modelMatrix.scale(1.8, 1.5, 1.8);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.2, 0.7, 0.3);
}

function drawTable(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures) {
    let n = buffers.indices.length;
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;
    
    // foot-front-left
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.5, y+0.0, z+3.8);
    g_modelMatrix.scale(0.4, 3.5, 0.4);
    gl.uniform1i(u_UseTextures, true);
    let boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      document.getElementById('wood')
    );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // foot-front-right
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+8.5, y+0.0, z+3.8);
    g_modelMatrix.scale(0.4, 3.5, 0.4);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // foot-back-left
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.5, y+0.0, z+0.0);
    g_modelMatrix.scale(0.4, 3.5, 0.4);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // foot-back-right
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+8.5, y+0.0, z+0.0);
    g_modelMatrix.scale(0.4, 3.5, 0.4);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // top
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+4.0, y+3.5, z+2.0);
    g_modelMatrix.scale(10.0, 0.2, 5.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // under-top-front
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+4.0, y+2.7, z+3.8);
    g_modelMatrix.scale(8.7, 0.8, 0.1);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // under-top-back
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+4.0, y+2.7, z+0);
    g_modelMatrix.scale(8.7, 0.8, 0.1);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // under-top-left
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.5, y+2.7, z+2);
    g_modelMatrix.scale(0.1, 0.8, 3.8);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // under-top-right
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+8.5, y+2.7, z+2);
    g_modelMatrix.scale(0.1, 0.8, 3.8);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);
    gl.uniform1i(u_UseTextures, false);
}

function drawChair(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures, shiftChair) {
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;

    gl.uniform1i(u_UseTextures, true);
    let boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      document.getElementById('wood')
    );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);

    // front-leg-left
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+2.0-shiftChair, y+0.0, z+2.17);
    g_modelMatrix.scale(0.35, 2.5, 0.35);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // front-leg-right
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+2.0-shiftChair, y+0.0, z-0.17);
    g_modelMatrix.scale(0.35, 2.5, 0.35);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-leg-right
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0-shiftChair, y+0.0, z-0.17);
    g_modelMatrix.scale(0.35, 2.5, 0.35);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-leg-left
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0-shiftChair, y+0.0, z+2.17);
    g_modelMatrix.scale(0.35, 2.5, 0.35);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // seat
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+1.0-shiftChair, y+2.5, z+1.0);
    g_modelMatrix.scale(2.5, 0.2, 2.9);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-left
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.25-shiftChair, y+2.5, z+2.17);
    g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
    g_modelMatrix.scale(0.25, 3.5, 0.4);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-right
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.25-shiftChair, y+2.5, z-0.17);
    g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
    g_modelMatrix.scale(0.25, 3.5, 0.4);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-top-1
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.54-shiftChair, y+5.5, z+1);
    g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
    g_modelMatrix.scale(0.10, 0.43, 1.95);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-top-2
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.46-shiftChair, y+4.7, z+1);
    g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
    g_modelMatrix.scale(0.10, 0.43, 1.95);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-top-3
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.38-shiftChair, y+3.9, z+1);
    g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
    g_modelMatrix.scale(0.10, 0.43, 1.95);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // back-top-4
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.3-shiftChair, y+3.1, z+1);
    g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
    g_modelMatrix.scale(0.10, 0.43, 1.95);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);
    gl.uniform1i(u_UseTextures, false);
}

function drawSofa(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures) {
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;
    
    // foot 1
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+2.0, y+0.0, z+5.7);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // foot 2
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+2.0, y+0.0, z-5.7);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // foot 3
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-2.0, y+0.0, z+5.7);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // foot 4
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-2.0, y+0.0, z-5.7);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // base
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+0.67, z+0.0);
    g_modelMatrix.scale(4.8, 1.5, 13.5);

    gl.uniform1i(u_UseTextures, true);
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      document.getElementById('leather')
    );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);

    // back
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-2.0, y+0.67, z+0.0);
    g_modelMatrix.scale(1.5, 4.5, 13.5);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);

    // right cusion
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.2, y+2.17, z-6.65);
    g_modelMatrix.scale(5, 1.37, 1.37);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);

    // left cusion
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.2, y+2.17, z+6.65);
    g_modelMatrix.scale(5, 1.37, 1.37);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);
    gl.uniform1i(u_UseTextures, false);

}

function drawSofaSmall(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures) {
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;
    
    // foot 1
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+1.5, y+0.0, z-1.75);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // foot 2
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+1.5, y+0.0, z+1.75);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // foot 3
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-1.5, y+0.0, z-1.75);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // foot 4
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-1.5, y+0.0, z+1.75);
    g_modelMatrix.scale(0.67, 0.67, 0.67);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.15,0.15,0.15);

    // base
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+0.67, z+0.0);
    g_modelMatrix.scale(4.0, 1.5, 4.5);
    gl.uniform1i(u_UseTextures, true);
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      document.getElementById('leather')
    );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);

    // back
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-2.0, y+0.67, z+0.0);
    g_modelMatrix.scale(1.5, 4.5, 4.5);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);

    // right cushion
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.2, y+2.17, z-2.55);
    g_modelMatrix.scale(4, 1.37, 1.37);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);

    // left cushion
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.2, y+2.17, z+2.55);
    g_modelMatrix.scale(4, 1.37, 1.37);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.1,0.1,0.1);
    gl.uniform1i(u_UseTextures, false);

}

function drawTV(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures) {
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;
    
    // TV main
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.25, y+1.2, z+0.0);
    g_modelMatrix.scale(0.3, 6.0, 9.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.2,0.2,0.2);

    // TV back panel
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+2.0, z+0.0);
    g_modelMatrix.scale(0.40, 4.0, 6.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.2,0.2,0.2);

    // leg-left base
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.25, y+0, z-3.0);
    g_modelMatrix.scale(2.0, 0.45, 0.45);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.4,0.4,0.4);

    // leg-left-connector
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.25, y+0, z-3.0);
    g_modelMatrix.scale(0.20, 1.3, 0.20);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.4,0.4,0.4);

    // leg-right base
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.25, y+0, z+3.0);
    g_modelMatrix.scale(2.0, 0.45, 0.45);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.4,0.4,0.4);

    // leg-right-connector
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-0.25, y+0, z+3.0);
    g_modelMatrix.scale(0.20, 1.3, 0.20);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.4,0.4,0.4);

  if (tvLight){
      g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
      g_modelMatrix.translate(x-0.46, y+1.33, z+0.0);
      g_modelMatrix.scale(0.05, 5.7, 8.5);
      drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,1.0,1.0);
  }
}

function drawTeapoy(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures){
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;
    
    // base
    gl.uniform1i(u_UseTextures, true);
    let boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      document.getElementById('wood')
    );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    g_modelMatrix.setRotate(y_rotate+0, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+0, z+0);
    g_modelMatrix.scale(1.5, 0.3, 1.5);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // leg
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+0.0, z+0);
    g_modelMatrix.scale(0.65, 3.65, 0.65);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);

    // top
    g_modelMatrix.setRotate(y_rotate+0, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+3.65, z+0);
    g_modelMatrix.scale(4, 0.3, 3);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1.0,0.8,0.4);
    gl.uniform1i(u_UseTextures, false);
}

function drawTVStand(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures) {
  let texCoords = buffers.texCoords;
  let texCoordsR = buffers.texCoordsFloor;
  // bottom-base
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.5, z+0.0);
  g_modelMatrix.scale(9.0, 0.25, 4.0);
  drawBox(gl, buffers,  viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92);

  //top-base
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.7, z);
  g_modelMatrix.scale(9.5, 0.25, 5.0);
  drawBox(gl, buffers,  viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92);

  // front-right
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.5, y+0, z+1);
  g_modelMatrix.scale(0.3, 1.7, 0.3);
  drawBox(gl, buffers,  viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.59,0.59,0.59);

  // front-left
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.5, y+0, z+1);
  g_modelMatrix.scale(0.3, 1.7, 0.3);
  drawBox(gl, buffers,  viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.59,0.59,0.59);

  // back-left
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.5, y+0, z-1);
  g_modelMatrix.scale(0.3, 1.7, 0.3);
  drawBox(gl, buffers,  viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.59,0.59,0.59);

  // back-right
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.5, y+0, z-1);
  g_modelMatrix.scale(0.3, 1.7, 0.3);
  drawBox(gl, buffers,  viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.59,0.59,0.59);
}

function drawShelf(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures, open) {
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;
    
    `
    gl.uniform1i(u_UseTextures, true);
    let boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      document.getElementById('wood')
    );
    
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    `
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
    g_modelMatrix.scale(9, 0.4, 3.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92);  // base

    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x-4.5, y+0.0, z+0.0);
    g_modelMatrix.scale(0.10, 10.0, 3.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // side-left

    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+4.5, y+0.0, z+0.0);
    g_modelMatrix.scale(0.10, 10.0, 3.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // side-right

    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+0.0, z-1.5);
    g_modelMatrix.rotate(90.0, 0.0,1.0,0.0);
    g_modelMatrix.scale(0.10, 10.0, 9);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // back

    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+10, z+0.0);
    g_modelMatrix.scale(9.1, 0.2, 3.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // top

    // shelfs
    for (let i=1;i<5;i++){
        g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
        g_modelMatrix.translate(x+0.0, y+0.35+2*i, z-0.2);
        g_modelMatrix.scale(8.9, 0.2, 2.7);
        drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // shelf 1
    }

    if (!open){
        g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
        g_modelMatrix.translate(x-2.26, y+0.475, z+1.5);
        g_modelMatrix.rotate(90, 0.0,1.0,0.0);
        g_modelMatrix.scale(0.10, 9.5, 4.48);
        drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // door-left

        g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
        g_modelMatrix.translate(x+2.26, y+0.475, z+1.5);
        g_modelMatrix.rotate(90.0, 0.0,1.0,0.0);
        g_modelMatrix.scale(0.10, 9.5, 4.488);
        drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // door-right
    }
    else{
        g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
        g_modelMatrix.translate(x-4.1, y+0.475, z+2.8);
        g_modelMatrix.rotate(10.0, 0.0,1.0,0.0);
        g_modelMatrix.scale(0.10, 9.5, 4.48);
        drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // door-left

        g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
        g_modelMatrix.translate(x+4.1, y+0.475, z+2.8);
        g_modelMatrix.rotate(-10.0, 0.0,1.0,0.0);
        g_modelMatrix.scale(0.10, 9.5, 4.48);
        drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,0.92,0.92,0.92); // door-right

    }
    gl.uniform1i(u_UseTextures, false);

}

function drawMat(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures) {
    let texCoords = buffers.texCoords;
    let texCoordsR = buffers.texCoordsFloor;
    
    // base
    gl.uniform1i(u_UseTextures, true);
    let boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
      gl.UNSIGNED_BYTE,
      document.getElementById('mat')
    );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
    g_modelMatrix.scale(15.0, 0.25, 10.0);
    drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,1,1,1);
    gl.uniform1i(u_UseTextures, false);

}

function drawWalls(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate, u_UseTextures){
  let texCoords = buffers.texCoords;
  let texCoordsR = buffers.texCoordsFloor;

  gl.uniform1i(u_UseTextures, true);

  // --- FLOOR ---
  let floorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, floorTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('floor')
  );

  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-7.25, y-0.5, z+2.5);
  g_modelMatrix.scale(40.75, 0.5, 40.0);
  
  initArrayBuffer(gl, 'a_TexCoords', texCoordsR, 2);
  drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.80, 0.80, 0.80);

  // --- RIGHT WALL ---
  let wallTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, wallTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('wall')
  );

  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-27.5, y+0.0, z+2.5);
  g_modelMatrix.scale(0.3, 15.0, 40.0);
  
  initArrayBuffer(gl, 'a_TexCoords', texCoords, 2);  
  drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.30859375,0.30859375,0.18359375);

  gl.uniform1i(u_UseTextures, false);
  
  // --- FRONT WALL ---
  //gl.bindTexture(gl.TEXTURE_2D, wallTexture);
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-7.25, y+0.0, z-17.5);
  g_modelMatrix.scale(40.75, 15.0, 0.3);
  
  //initArrayBuffer(gl, 'a_TexCoords', texCoords, 2);
  drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.30859375,0.30859375,0.18359375);

  // --- LEFT WALL ---
  //gl.bindTexture(gl.TEXTURE_2D, wallTexture);
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-27.5, y+0.0, z+2.5);
  g_modelMatrix.scale(0.3, 15.0, 40.0);
  
  //initArrayBuffer(gl, 'a_TexCoords', texCoords, 2);
  //drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.30859375,0.30859375,0.18359375);

  // --- CEILING ---
  //gl.bindTexture(gl.TEXTURE_2D, wallTexture);
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-7.25, y+15.0, z+2.5);
  g_modelMatrix.scale(40.75, 0.3, 40.0);
  
  //initArrayBuffer(gl, 'a_TexCoords', texCoords, 2);
  //drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 1.0, 1.0, 1.0);
}

// Matriz de transformação de coordenadas para normais
let g_normalMatrix = new Matrix4();

function drawBox(gl, buffers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,r,g, b) {
    let n = buffers.indices.length; // obtém o número de índices para os vértices
    // Cria um array de cores para cada vértice do cub
    let colors = new Float32Array([
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v1-v2-v3 frente
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v3-v4-v5 direita
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v5-v6-v1 cima
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v1-v6-v7-v2 esquerda
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v7-v4-v3-v2 baixo
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v4-v7-v6-v5 atrás
    ]);
    // Inicializa o buffer de cores
    if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;
    
    // Configura a matriz de visualização para a transformação MVP
    g_mvpMatrix.set(viewProjMatrix); //copia a matriz de visualização
    g_mvpMatrix.multiply(g_modelMatrix); // multiplica pela matriz do modelo

    // Envia a matriz MVP para o shader
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

    // Calcula a matriz normal (inversa da matriz do modelo transposta)
    g_normalMatrix.setInverseOf(g_modelMatrix); // inversa
    g_normalMatrix.transpose(); // transposta
    // Envia a matriz normal para o shader
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    // Desenha o cubo usando o buffer de índices
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    // Reseta a matriz do modelo para próximas chamadas
    g_modelMatrix = new Matrix4();
}