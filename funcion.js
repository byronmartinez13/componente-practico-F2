document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const k = 8.99e9;

  function val(id) {
    return parseFloat(document.getElementById(id).value);
  }

  // Valores originales ingresados por el usuario
  const q1val = val("q1");
  const q2val = val("q2");
  const q3val = val("q3");

  // Unidades seleccionadas en texto
  const u1text = document.getElementById("u1").options[document.getElementById("u1").selectedIndex].text;
  const u2text = document.getElementById("u2").options[document.getElementById("u2").selectedIndex].text;
  const u3text = document.getElementById("u3").options[document.getElementById("u3").selectedIndex].text;

  // Conversiones a Coulomb
  const q1 = q1val * val("u1");
  const q2 = q2val * val("u2");
  const q3 = q3val * val("u3");
  const L = val("lado");

  // Coordenadas del triángulo equilátero
  const x1 = 0, y1 = 0;
  const x2 = L, y2 = 0;
  const x3 = L / 2, y3 = (Math.sqrt(3) / 2) * L;

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
  let angulo = Math.atan2(fyTotal, fxTotal) * (180 / Math.PI);
  if (angulo < 0) angulo += 360;

  function r2(x) {
    return Math.round(x * 100) / 100;
  }

  document.getElementById("resultado").innerHTML = `
    <strong>Resultados:</strong><br><br>
    🔴 <strong>Fuerza que ejerce la carga 1 sobre la carga 3:</strong> ${r2(f13.F)} N<br>
    ➤ Fx₁₃ = ${r2(f13.fx)} N<br>
    ➤ Fy₁₃ = ${r2(f13.fy)} N<br><br>
    🔵 <strong>Fuerza que ejerce la carga 2 sobre la carga 3:</strong> ${r2(f23.F)} N<br>
    ➤ Fx₂₃ = ${r2(f23.fx)} N<br>
    ➤ Fy₂₃ = ${r2(f23.fy)} N<br><br>
    🟢 <strong>Fuerza total sobre la carga 3:</strong> ${r2(Ft)} N<br>
    ➤ Fx = ${r2(fxTotal)} N<br>
    ➤ Fy = ${r2(fyTotal)} N<br>
    ➤ Ángulo = ${r2(angulo)}°
  `;

  const canvas = document.getElementById("grafico");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const scale = 220;

  function plano() {
    ctx.strokeStyle = "#ccc";
    for (let i = 0; i <= canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(canvas.width, cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, canvas.height);
    ctx.stroke();
  }

  function dibujarCarga(x, y, color, label, valorConvertido, valorOriginal, unidadOriginal) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Signo dentro del círculo
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(valorOriginal >= 0 ? "+" : "–", x, y);

    // Etiqueta q1, q2, q3
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 18, y - 12);

    // Valor original + unidad
    ctx.font = "12px Arial";
    ctx.fillText(`${valorOriginal >= 0 ? "+" : "-"}${Math.abs(valorOriginal)} ${unidadOriginal}`, x + 18, y + 6);
  }

  function dibujarVector(xo, yo, fx, fy, color, label) {
    ctx.beginPath();
    ctx.moveTo(xo, yo);
    ctx.lineTo(xo + fx * 1e7, yo - fy * 1e7);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = color;
      ctx.fillText(label, xo + fx * 1e7 + 5, yo - fy * 1e7 - 5);
    }
  }

  function dibujarTriangulo(a, b, c, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(a[0], a[1]);
    ctx.stroke();
  }

  plano();

  const x1p = cx + x1 * scale, y1p = cy - y1 * scale;
  const x2p = cx + x2 * scale, y2p = cy - y2 * scale;
  const x3p = cx + x3 * scale, y3p = cy - y3 * scale;

  dibujarTriangulo([x1p, y1p], [x2p, y2p], [x3p, y3p], "#888");

  // Dibujo de cargas con valor original y unidad
  dibujarCarga(x1p, y1p, "red", "q1", q1, q1val, u1text);
  dibujarCarga(x2p, y2p, "blue", "q2", q2, q2val, u2text);
  dibujarCarga(x3p, y3p, "green", "q3", q3, q3val, u3text);

  // Vectores principales
  dibujarVector(x3p, y3p, f13.fx, f13.fy, "orange", "F₁₃");
  dibujarVector(x3p, y3p, f23.fx, f23.fy, "purple", "F₂₃");

  // TRIÁNGULOS DE DESCOMPOSICIÓN

  const fx13px = f13.fx * 1e7;
  const fy13py = -f13.fy * 1e7;
  dibujarTriangulo(
    [x3p, y3p],
    [x3p + fx13px, y3p],
    [x3p + fx13px, y3p + fy13py],
    "#aaf"
  );
  dibujarVector(x3p, y3p, f13.fx, 0, "blue", "F₁₃ₓ");
  dibujarVector(x3p + fx13px, y3p, 0, f13.fy, "red", "F₁₃ᵧ");

  const fx23px = f23.fx * 1e7;
  const fy23py = -f23.fy * 1e7;
  dibujarTriangulo(
    [x3p, y3p],
    [x3p + fx23px, y3p],
    [x3p + fx23px, y3p + fy23py],
    "#aaf"
  );
  dibujarVector(x3p, y3p, f23.fx, 0, "blue", "F₂₃ₓ");
  dibujarVector(x3p + fx23px, y3p, 0, f23.fy, "red", "F₂₃ᵧ");
});


