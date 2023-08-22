var canvas = document.body.appendChild(document.createElement("canvas")),
    gl = canvas.getContext("webgl2"),
    program = createProgram(glsl("#vertex-shader"), glsl("#fragment-shader")),
    mouse = program.createUniform("2f", "mouse"),
    i_resolution = program.createUniform("2f", "iResolution"),
    i_time = program.createUniform("1f", "iTime"),
    texture = loadTexture(gl),
    uSampler = gl.getUniformLocation(program, "uSampler");
    uSampler1 = gl.getUniformLocation(program, "uSampler1");
let color_1 = program.createUniform("3f", "color_1"),
    color_1p = program.createUniform("3f", "color_1p"),
    color_2 = program.createUniform("3f", "color_2"),
    color_2p = program.createUniform("3f", "color_2p"),
    color_3 = program.createUniform("3f", "color_3");

let i_visuals = {};
let a_visuals = [0,0,0,0,0,0,0,0,0,0];
for (let iv = 1; iv < 11; iv++) {
    i_visuals[`v_n${iv}`] = program.createUniform('1f', `v_n${iv}`);
}

function listen(eventType) {
    window.addEventListener(eventType, (function (e) {
        mouse(e.x, canvas.height - e.y), i_resolution(canvas.width, canvas.height), render()
    }))
}
gl.useProgram(program);
let transition = 0;
var iTransition = program.createUniform("1f", "iTransition");
let prevFrame = Date.now(),
    deltaTime = 0;

function render(time) {
    deltaTime = Date.now() - prevFrame, prevFrame = Date.now();
    gl.viewport(0, 0, canvas.width = window.innerWidth, canvas.height = window.innerHeight);
    i_resolution(canvas.width, canvas.height);
    i_time(.001 * time);

    let freq_len = frequency_array.length;
    let half_len = freq_len / 2;

    if (internal.power < 0.01) {
        transition = Math.min(1.0, transition + 0.01);
    } else {
        transition = Math.max(0, transition - 0.01);
    }

    iTransition(transition);

    for (let i = 1; i < 11; i++) {
        let j = Math.floor(((i - 1) / 10) * half_len);
        let val = (frequency_array[j] + frequency_array[j + 64]) / 2;
        var i_vs = i_visuals[`v_n${i}`];
        i_vs(val);
    }

    color_1(options.theme.color_1.r, options.theme.color_1.g, options.theme.color_1.b);
    color_1p(options.theme.color_2.r, options.theme.color_2.g, options.theme.color_2.b);
    color_2(options.theme.color_mix_1.r, options.theme.color_mix_1.g, options.theme.color_mix_1.b);
    color_2p(options.theme.color_mix_2.r, options.theme.color_mix_2.g, options.theme.color_mix_2.b);
    color_3(options.theme.background.r, options.theme.background.g, options.theme.background.b);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uSampler, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
    requestAnimationFrame(render)
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0,
        internalFormat = gl.RGBA,
        width = 1,
        height = 1,
        border = 0,
        srcFormat = gl.RGBA,
        srcType = gl.UNSIGNED_BYTE,
        pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 1, 1, 0, srcFormat, srcType, pixel);
    const image = document.getElementsByClassName("mask")[0];
    return gl.bindTexture(gl.TEXTURE_2D, texture), gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, image), isPowerOf2(image.width) && isPowerOf2(image.height) ? gl.generateMipmap(gl.TEXTURE_2D) : (gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)), console.info("Loaded Texture!"), texture
}

function isPowerOf2(value) {
    return 0 == (value & value - 1)
}

function createShader(source, type) {
    var shader = gl.createShader(type);
    if (gl.shaderSource(shader, source), gl.compileShader(shader), !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader
}

function createProgram(vertex, fragment) {
    var program = gl.createProgram();
    return gl.attachShader(program, createShader(vertex, gl.VERTEX_SHADER)), gl.attachShader(program, createShader(fragment, gl.FRAGMENT_SHADER)), gl.linkProgram(program), program.createUniform = function (type, name) {
        var location = gl.getUniformLocation(program, name);
        return function (v1, v2, v3, v4) {
            gl["uniform" + type](location, v1, v2, v3, v4)
        }
    }, program
}

function glsl(name) {
    let text = document.querySelector(name).innerHTML.trim();
    return console.info(text), text
}
requestAnimationFrame(render);