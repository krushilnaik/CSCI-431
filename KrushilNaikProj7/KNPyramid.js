let canvas;
let gl;

let numVertices = 12;

let texSize = 256;
let numChecks = 8;

let program;

let texture1, texture2;
let t1, t2;

let c;

let flag = true;

let image1 = new Uint8Array(4 * texSize * texSize);

for (let i = 0; i < texSize; i++) {
  for (let j = 0; j < texSize; j++) {
    let patchx = Math.floor(i / (texSize / numChecks));
    let patchy = Math.floor(j / (texSize / numChecks));
    // if (patchx % 2 ^ patchy % 2) c = 255;
    // else c = 0;

    c = patchx % 2 ^ patchy % 2 ? 255 : 0;

    image1[4 * i * texSize + 4 * j] = c;
    image1[4 * i * texSize + 4 * j + 1] = c;
    image1[4 * i * texSize + 4 * j + 2] = c;
    image1[4 * i * texSize + 4 * j + 3] = 255;
  }
}

let image2 = new Uint8Array(4 * texSize * texSize);

// Create a checkerboard pattern
for (let i = 0; i < texSize; i++) {
  for (let j = 0; j < texSize; j++) {
    image2[4 * i * texSize + 4 * j] = 127 + 127 * Math.sin(0.1 * i * j);
    image2[4 * i * texSize + 4 * j + 1] = 127 + 127 * Math.sin(0.1 * i * j);
    image2[4 * i * texSize + 4 * j + 2] = 127 + 127 * Math.sin(0.1 * i * j);
    image2[4 * i * texSize + 4 * j + 3] = 255;
  }
}

let pointsArray = [];
let colorsArray = [];
let texCoordsArray = [];

let texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)];

let vertices = [
  vec4(0.5, -0.2722, 0.2886, 1.0),
  vec4(0.0, -0.2772, -0.5773, 1.0),
  vec4(-0.5, -0.2722, 0.2886, 1.0),
  vec4(0.0, 0.5443, 0.0, 1.0),
];

let vertexColors = [
  vec4(1.0, 0.0, 0.0, 1.0),
  vec4(1.0, 1.0, 0.0, 1.0),
  vec4(0.0, 1.0, 0.0, 1.0),
  vec4(0.0, 0.0, 1.0, 1.0),
  vec4(1.0, 0.0, 1.0, 1.0),
  vec4(0.0, 1.0, 1.0, 1.0),
  vec4(0.0, 1.0, 1.0, 1.0),
];

let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = xAxis;

let theta = [45.0, 45.0, 45.0];

let thetaLoc;

function configureTexture() {
  texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    texSize,
    texSize,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image1
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  texture2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    texSize,
    texSize,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image2
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function triangle(a, b, c) {
  pointsArray.push(vertices[a]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(vertices[b]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(vertices[c]);
  colorsArray.push(vertexColors[a]);
  texCoordsArray.push(texCoord[2]);
}

function colorPyramid() {
  triangle(0, 1, 2);
  triangle(1, 2, 3);
  triangle(2, 0, 3);
  triangle(3, 1, 0);
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  colorPyramid();

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

  let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);

  configureTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.uniform1i(gl.getUniformLocation(program, "Tex0"), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.uniform1i(gl.getUniformLocation(program, "Tex1"), 1);

  thetaLoc = gl.getUniformLocation(program, "theta");

  document.getElementById("ButtonX").onclick = function () {
    axis = xAxis;
  };
  document.getElementById("ButtonY").onclick = function () {
    axis = yAxis;
  };
  document.getElementById("ButtonZ").onclick = function () {
    axis = zAxis;
  };
  document.getElementById("ButtonT").onclick = function () {
    flag = !flag;
  };

  render();
};

let render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (flag) theta[axis] += 2.0;
  gl.uniform3fv(thetaLoc, theta);
  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
  requestAnimFrame(render);
};
