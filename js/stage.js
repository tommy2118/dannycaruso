// The lighting rig: one fullscreen shader that paints a dark stage in haze.
// It takes a look (gel, wash, ghost light, followspot) and fades to it the
// way a board op runs a cue. It knows nothing about shows, cues or scrolling.

const VERTEX = `#version 300 es
in vec2 corner;
void main() { gl_Position = vec4(corner, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uAim;
uniform vec2 uBulb;
uniform vec3 uGel;
uniform float uWash, uGhost, uSpot;
out vec4 outColor;

const float FLOOR = -0.1;
const vec3 WARM = vec3(1.0, 0.72, 0.42);
const vec3 SPOT = vec3(0.92, 0.95, 1.0);

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= 0.5; }
  return v;
}

// A cone of light seen through haze, from a lamp to where it lands.
float beam(vec2 p, vec2 lamp, vec2 lands, float spread) {
  vec2 d = lands - lamp;
  float len = length(d);
  vec2 n = d / len;
  float t = dot(p - lamp, n);
  float off = abs(dot(p - lamp, vec2(-n.y, n.x)));
  float w = 0.008 + spread * max(t, 0.0);
  float core = 1.0 - smoothstep(w * 0.45, w, off);
  float reach = smoothstep(-0.02, 0.1, t) * (1.0 - smoothstep(len * 0.96, len * 1.08, t));
  return core * reach * (0.45 + 0.55 * (1.0 - t / len));
}

// Where a lamp lands; squashed on the deck for perspective.
float pool(vec2 p, vec2 at, float r) {
  float squash = p.y < FLOOR ? 3.0 : 1.0;
  vec2 q = (p - at) * vec2(1.0, squash);
  return exp(-dot(q, q) / (r * r));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float haze = fbm(p * 2.4 + vec2(uTime * 0.022, uTime * 0.006));
  haze = 0.3 + 1.4 * haze * haze;

  bool deck = p.y < FLOOR;
  vec3 surface = vec3(0.07, 0.065, 0.075);
  if (deck) {
    float depth = FLOOR - p.y;
    float across = p.x / (depth + 0.16);
    float seam = smoothstep(0.46, 0.5, abs(fract(across * 2.2) - 0.5));
    float grain = noise(vec2(across * 9.0, depth * 140.0));
    surface = vec3(0.13, 0.1, 0.08) * (0.8 + 0.3 * grain) * (1.0 - 0.55 * seam);
  }

  vec2 base = vec2(uBulb.x, uBulb.y - 0.27);
  float bulbDist = length(p - uBulb);
  vec2 washL = vec2(-aspect * 0.5 - 0.1, 0.56);
  vec2 washR = vec2(aspect * 0.5 + 0.1, 0.56);
  vec2 markL = vec2(-0.2, FLOOR - 0.14);
  vec2 markR = vec2(0.2, FLOOR - 0.14);
  vec2 spotLamp = vec2(uAim.x * 0.3, 0.68);

  // Light falling on the set.
  vec3 lit = vec3(0.025);
  lit += WARM * uGhost * (0.9 / (1.0 + bulbDist * bulbDist * 22.0));
  lit += WARM * uGhost * pool(p, base, 0.2) * 0.8;
  lit += uGel * uWash * (pool(p, markL, 0.42) + pool(p, markR, 0.42)) * 1.4;
  lit += SPOT * uSpot * pool(p, uAim, 0.15) * 3.0;
  vec3 col = surface * lit;

  // The cyc glows from the groundrow in the show's gel.
  if (!deck) col += uGel * uWash * 0.2 * exp(-(p.y - FLOOR) * 3.5);

  // The ghost light's stand, lit by its own bulb.
  float pole = (1.0 - smoothstep(0.0012, 0.0028, abs(p.x - uBulb.x))) * step(base.y, p.y) * step(p.y, uBulb.y - 0.012);
  float foot = 1.0 - smoothstep(0.0, 0.004, length((p - base) * vec2(1.0, 4.0)) - 0.025);
  col = mix(col, vec3(0.05, 0.04, 0.035) + WARM * (0.06 + uGhost * 0.25), max(pole, foot) * 0.9);

  // Beams in the air.
  vec3 air = vec3(0.0);
  air += uGel * uWash * (beam(p, washL, markR, 0.2) + beam(p, washR, markL, 0.2)) * 0.11;
  air += SPOT * uSpot * beam(p, spotLamp, uAim, 0.14) * 0.2;
  air += WARM * uGhost * 0.05 / (1.0 + bulbDist * bulbDist * 60.0);
  col += air * haze;

  // The bare bulb itself.
  col += WARM * uGhost * (exp(-bulbDist * bulbDist * 9000.0) * 2.5 + exp(-bulbDist * bulbDist * 600.0) * 0.35);
  col += vec3(1.0, 0.95, 0.85) * uGhost * exp(-bulbDist * bulbDist * 40000.0) * 2.0;

  col = 1.0 - exp(-col * 1.7);
  vec2 v = p * vec2(0.75, 1.05);
  col *= 1.0 - 0.5 * dot(v, v);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.018;
  outColor = vec4(max(col, 0.0), 1.0);
}`;

export function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}

const ease = (k) => k * k * (3 - 2 * k);
const mix = (a, b, k) => a + (b - a) * k;
const DARK = { gel: [0, 0, 0], wash: 0, ghost: 0, spot: 0 };

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

// Returns null when the browser can't light the stage; the page still works.
export function createStage(canvas, { frame, clock, still = false, fade = 1600, pixelRatio = 1 }) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  if (!gl) return null;

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const corner = gl.getAttribLocation(program, "corner");
  gl.enableVertexAttribArray(corner);
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);

  const u = Object.fromEntries(
    ["uRes", "uTime", "uAim", "uBulb", "uGel", "uWash", "uGhost", "uSpot"].map((name) => [name, gl.getUniformLocation(program, name)])
  );

  let from = DARK, to = DARK, cueStarted = clock();
  let aim = { x: 0, y: -0.25 }, target = null, lastFrame = clock();

  const current = (now) => {
    const k = fade === 0 ? 1 : ease(Math.min(1, (now - cueStarted) / fade));
    return {
      gel: from.gel.map((c, i) => mix(c, to.gel[i], k)),
      wash: mix(from.wash, to.wash, k),
      ghost: mix(from.ghost, to.ghost, k),
      spot: mix(from.spot, to.spot, k),
    };
  };

  const resize = () => {
    const w = Math.round(canvas.clientWidth * pixelRatio);
    const h = Math.round(canvas.clientHeight * pixelRatio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const draw = () => {
    const now = clock();
    const seconds = still ? 12 : now / 1000;
    const dt = Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;
    resize();

    const aspect = canvas.width / canvas.height;
    // With no one on the spot, it holds the actor's mark and breathes.
    const goal = target ?? { x: Math.sin(seconds * 0.45) * 0.06, y: -0.26 + Math.sin(seconds * 0.3) * 0.015 };
    // A followspot operator lags the actor a little.
    const follow = still ? 1 : 1 - Math.exp(-dt * 5);
    aim = { x: mix(aim.x, goal.x, follow), y: mix(aim.y, goal.y, follow) };

    const look = current(now);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTime, seconds);
    gl.uniform2f(u.uAim, aim.x, aim.y);
    gl.uniform2f(u.uBulb, Math.min(0.42, aspect * 0.3), -0.02);
    gl.uniform3fv(u.uGel, look.gel);
    gl.uniform1f(u.uWash, look.wash);
    gl.uniform1f(u.uGhost, look.ghost);
    gl.uniform1f(u.uSpot, look.spot);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frame(draw);
  };

  return {
    setLook(look) {
      const now = clock();
      from = current(now);
      to = { ...look, gel: hexToRgb(look.gel) };
      cueStarted = now;
    },
    // x and y are fractions of the viewport, from the top left.
    aim(x, y) {
      const aspect = canvas.clientWidth / canvas.clientHeight;
      target = { x: (x - 0.5) * aspect, y: 0.5 - y };
    },
    rest() { target = null; },
    start() { frame(draw); },
  };
}
