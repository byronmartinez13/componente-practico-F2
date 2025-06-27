document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const k = 8.99e9; 

  function val(id) {
    return parseFloat(document.getElementById(id).value);
  }

  const q1val = val("q1"), q2val = val("q2"), q3val = val("q3");
  const u1 = val("u1"), u2 = val("u2"), u3 = val("u3");
  const q1 = q1val * u1, q2 = q2val * u2, q3 = q3val * u3;
  const d12 = val("d12"), d13 = val("d13"), d23 = val("d23");

  const x1 = 0, y1 = 0;
  const x2 = d12, y2 = 0;
  const x3 = (d12 ** 2 + d13 ** 2 - d23 ** 2) / (2 * d12);
  const y3 = Math.sqrt(Math.max(0, d13 ** 2 - x3 ** 2));

  const ang1 = Math.acos((d12 ** 2 + d13 ** 2 - d23 ** 2) / (2 * d12 * d13)) * 180 / Math.PI;
  const ang2 = Math.acos((d12 ** 2 + d23 ** 2 - d13 ** 2) / (2 * d12 * d23)) * 180 / Math.PI;
  const ang3 = 180 - ang1 - ang2;

  function calcF(qi, xi, yi) {
    const dx = xi - x3;
    const dy = yi - y3;
    const r = Math.sqrt(dx ** 2 + dy ** 2);
    const F = k * Math.abs(qi * q3) / (r ** 2);
    const signo = (qi * q3 < 0) ? 1 : -1;
    const fx = signo * F * (dx / r);
    const fy = signo * F * (dy / r);
    return { fx, fy, F };
  }

  const f13 = calcF(q1, x1, y1);
  const f23 = calcF(q2, x2, y2);
  const fxTotal = f13.fx + f23.fx;
  const fyTotal = f13.fy + f23.fy;
  const Ft = Math.sqrt(fxTotal ** 2 + fyTotal ** 2);
  let angulo = Math.atan2(fyTotal, fxTotal) * 180 / Math.PI;
  if (angulo < 0) angulo += 360;

  const canvas = document.getElementById("grafico");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  function drawTextWithBackground(text, x, y, color = "#000", bgColor = "rgba(255,255,255,0.7)") {
    const padding = 4;
    const metrics = ctx.measureText(text);
    const width = metrics.width + padding * 2;
    const height = 18;
    ctx.fillStyle = bgColor;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function dibujarTriangulo(a, b, c, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.lineTo(...c);
    ctx.closePath();
    ctx.stroke();
  }

  function dibujarCarga(x, y, color, label, valor, unidad) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.fillText(valor >= 0 ? "+" : "–", x, y);
    ctx.fillStyle = color;
    ctx.fillText(label, x, y - 25);
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.fillText(`${valor} ${unidad}`, x, y + 25);
  }

  function dibujarVector(x, y, fx, fy, color, label) {
    const esc = 0.5e7;
    const dx = fx * esc, dy = -fy * esc;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    const angle = Math.atan2(dy, dx);
    const arrow = 10;
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - arrow * Math.cos(angle - Math.PI / 6), y + dy - arrow * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + dx - arrow * Math.cos(angle + Math.PI / 6), y + dy - arrow * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    if (label) drawTextWithBackground(label, x + dx / 2, y + dy / 2 - 10, color);
  }

function dibujarAngulo(x, y, angulo, radio, color) {
  // Determinar el ángulo inicial según el vértice
  // Esto intenta "mirar" hacia el centro del triángulo (asumido en medio)
  const centroX = (x1p + x2p + x3p) / 3;
  const centroY = (y1p + y2p + y3p) / 3;
  const dx = centroX - x;
  const dy = centroY - y;
  const startAngle = Math.atan2(dy, dx);
  const endAngle = startAngle + angulo * Math.PI / 180;

  // Dibujar arco
  ctx.beginPath();
  ctx.arc(x, y, radio, startAngle, endAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Posicionar el texto
  const labelAngle = (startAngle + endAngle) / 2;
  const labelX = x + (radio + 12) * Math.cos(labelAngle);
  const labelY = y + (radio + 12) * Math.sin(labelAngle);
  drawTextWithBackground(`${Math.round(angulo)}°`, labelX, labelY, color);
}


  function dibujarDistancia(x1, y1, x2, y2, distancia) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    const offset = 15;
    const tx = mx + offset * Math.cos(angle);
    const ty = my + offset * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    drawTextWithBackground(`${distancia} m`, tx, ty, "#333");
  }

  const padding = 60;
  const maxX = Math.max(x1, x2, x3);
  const maxY = Math.max(y1, y2, y3);
  const scale = Math.min(
    (canvas.width - padding * 2) / maxX,
    (canvas.height - padding * 2) / maxY
  );

  const x1p = padding + x1 * scale,
        y1p = canvas.height - padding - y1 * scale;
  const x2p = padding + x2 * scale,
        y2p = canvas.height - padding - y2 * scale;
  const x3p = padding + x3 * scale,
        y3p = canvas.height - padding - y3 * scale;

  dibujarTriangulo([x1p, y1p], [x2p, y2p], [x3p, y3p], "#555");
  dibujarCarga(x1p, y1p, "red", "q₁", q1val, document.getElementById("u1").options[document.getElementById("u1").selectedIndex].text);
  dibujarCarga(x2p, y2p, "blue", "q₂", q2val, document.getElementById("u2").options[document.getElementById("u2").selectedIndex].text);
  dibujarCarga(x3p, y3p, "green", "q₃", q3val, document.getElementById("u3").options[document.getElementById("u3").selectedIndex].text);
  dibujarVector(x3p, y3p, f13.fx, f13.fy, "#FF5722", "F₁₃");
  dibujarVector(x3p, y3p, f23.fx, f23.fy, "#3F51B5", "F₂₃");
ctx.globalAlpha = 0.6;

// F13: descomposición como triángulo
const xFx13 = x3p + f13.fx * 0.5e7;
const yFx13 = y3p;
dibujarVector(x3p, y3p, f13.fx, 0, "#E91E63", "F₁₃ₓ");
dibujarVector(xFx13, yFx13, 0, f13.fy, "#4CAF50", "F₁₃ᵧ");

// F23: descomposición como triángulo
const xFx23 = x3p + f23.fx * 0.5e7;
const yFx23 = y3p;
dibujarVector(x3p, y3p, f23.fx, 0, "#E91E63", "F₂₃ₓ");
dibujarVector(xFx23, yFx23, 0, f23.fy, "#4CAF50", "F₂₃ᵧ");

ctx.globalAlpha = 1.0;
  //dibujarVector(x3p, y3p, fxTotal, fyTotal, "#FFC107", "Fₜ");
  dibujarDistancia(x1p, y1p, x2p, y2p, d12);
  dibujarDistancia(x1p, y1p, x3p, y3p, d13);
  dibujarDistancia(x2p, y2p, x3p, y3p, d23);
  dibujarAngulo(x1p, y1p, ang1, 30, "red");
  dibujarAngulo(x2p, y2p, ang2, 30, "blue");
  dibujarAngulo(x3p, y3p, ang3, 30, "green");

  document.getElementById("resultado").innerHTML = `
    <strong>Resultados:</strong><br><br>
    🔴 <strong>Fuerza que ejerce la carga 1 sobre la carga 3:</strong> ${Ft ? f13.F.toFixed(2) : 0} N<br>
    ➤ Fx₁₃ = ${f13.fx.toFixed(2)} N<br>
    ➤ Fy₁₃ = ${f13.fy.toFixed(2)} N<br><br>
    🔵 <strong>Fuerza que ejerce la carga 2 sobre la carga 3:</strong> ${Ft ? f23.F.toFixed(2) : 0} N<br>
    ➤ Fx₂₃ = ${f23.fx.toFixed(2)} N<br>
    ➤ Fy₂₃ = ${f23.fy.toFixed(2)} N<br><br>
    🟢 <strong>Fuerza total sobre la carga 3:</strong> ${Ft.toFixed(2)} N<br>
    ➤ Fx = ${fxTotal.toFixed(2)} N<br>
    ➤ Fy = ${fyTotal.toFixed(2)} N<br>
    ➤ Ángulo resultante = ${angulo.toFixed(2)}°<br>
  `;
});


