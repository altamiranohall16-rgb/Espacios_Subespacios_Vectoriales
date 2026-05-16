const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.15 });
revealItems.forEach(item => observer.observe(item));

document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 18;
  const y = (e.clientY / window.innerHeight - 0.5) * 18;
  document.documentElement.style.setProperty('--mx', `${x}deg`);
  document.documentElement.style.setProperty('--my', `${y}deg`);
});

const canvas = document.getElementById('vectorCanvas');
const ctx = canvas.getContext('2d');
const alpha = document.getElementById('alpha');
const beta = document.getElementById('beta');
const alphaValue = document.getElementById('alphaValue');
const betaValue = document.getElementById('betaValue');
const formulaBox = document.getElementById('formulaBox');
const randomBtn = document.getElementById('randomBtn');

const u = { x: 2, y: 1 };
const v = { x: 1, y: 2.5 };
const scale = 55;

function drawArrow(vec, color, label, lineWidth = 4) {
  const ox = canvas.width / 2;
  const oy = canvas.height / 2;
  const x = ox + vec.x * scale;
  const y = oy - vec.y * scale;
  const angle = Math.atan2(y - oy, x - ox);
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 14 * Math.cos(angle - Math.PI / 6), y - 14 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x - 14 * Math.cos(angle + Math.PI / 6), y - 14 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = '700 16px Segoe UI';
  ctx.fillText(label, x + 10, y - 10);
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(3,10,20,.82)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(65,231,255,.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();
}

function renderVectors() {
  const a = Number(alpha.value);
  const b = Number(beta.value);
  const w = { x: a * u.x + b * v.x, y: a * u.y + b * v.y };
  alphaValue.textContent = a.toFixed(1);
  betaValue.textContent = b.toFixed(1);
  formulaBox.textContent = `w = ${a.toFixed(1)}u + ${b.toFixed(1)}v = (${w.x.toFixed(1)}, ${w.y.toFixed(1)})`;
  drawGrid();
  drawArrow(u, '#41e7ff', 'u');
  drawArrow(v, '#ba55ff', 'v');
  drawArrow(w, '#3bffb1', 'w', 6);
}

alpha.addEventListener('input', renderVectors);
beta.addEventListener('input', renderVectors);
randomBtn.addEventListener('click', () => {
  alpha.value = (Math.random() * 8 - 4).toFixed(1);
  beta.value = (Math.random() * 8 - 4).toFixed(1);
  renderVectors();
});
renderVectors();

function toggleAnswer(button) {
  const answer = button.parentElement.querySelector('.answer');
  answer.classList.toggle('open');
  button.textContent = answer.classList.contains('open') ? 'Ocultar respuesta' : 'Ver respuesta';
}
window.toggleAnswer = toggleAnswer;

const quizzes = {
  1: [
    { q: 'Para que W sea subespacio, ¿qué debe contener obligatoriamente?', o: ['Solo vectores positivos', 'El vector cero', 'Únicamente dos vectores'], a: 1, exp: 'Todo subespacio debe contener al vector cero.' },
    { q: 'La recta y = 3x en R² es:', o: ['Subespacio', 'No subespacio', 'Matriz'], a: 0, exp: 'Pasa por el origen y es cerrada bajo suma y multiplicación escalar.' },
    { q: 'La recta y = x + 2 en R² no es subespacio porque:', o: ['Tiene pendiente', 'No pasa por el origen', 'Tiene muchos puntos'], a: 1, exp: 'Al no contener al vector cero, falla una condición esencial.' }
  ],
  2: [
    { q: 'Una combinación lineal tiene la forma:', o: ['u/v', 'αu + βv', 'u² + v²'], a: 1, exp: 'Se multiplican vectores por escalares y luego se suman.' },
    { q: 'Si u=(1,2) y v=(3,0), entonces u+v es:', o: ['(4,2)', '(3,2)', '(2,4)'], a: 0, exp: 'Se suman coordenada a coordenada: (1+3, 2+0).' },
    { q: 'Una base debe ser:', o: ['Generadora e independiente', 'Solo grande', 'Siempre de 10 vectores'], a: 0, exp: 'Una base genera el espacio y no tiene vectores redundantes.' }
  ]
};

function mountQuiz(id) {
  const box = document.querySelector(`.quiz[data-quiz="${id}"]`);
  let index = 0;
  let score = 0;
  function render() {
    const item = quizzes[id][index];
    box.innerHTML = `
      <div class="quiz-question">${index + 1}. ${item.q}</div>
      <div class="options">${item.o.map((op, i) => `<button data-i="${i}">${op}</button>`).join('')}</div>
      <div class="quiz-feedback"></div>
      <div class="quiz-progress"><span>Pregunta ${index + 1}/${quizzes[id].length}</span><span>Puntaje: ${score}</span></div>
    `;
    box.querySelectorAll('button[data-i]').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = Number(btn.dataset.i);
        const isCorrect = selected === item.a;
        if (isCorrect) score++;
        box.querySelectorAll('button[data-i]').forEach((b, i) => {
          b.disabled = true;
          if (i === item.a) b.classList.add('correct');
          if (i === selected && !isCorrect) b.classList.add('wrong');
        });
        box.querySelector('.quiz-feedback').innerHTML = `${isCorrect ? '✅ Correcto.' : '❌ Revisa.'} ${item.exp}<br><br><button class="btn primary small" id="next${id}">${index === quizzes[id].length - 1 ? 'Ver resultado' : 'Siguiente'}</button>`;
        document.getElementById(`next${id}`).addEventListener('click', () => {
          index++;
          if (index >= quizzes[id].length) {
            box.innerHTML = `<div class="quiz-question">Resultado final</div><p class="quiz-feedback">Obtuviste <strong>${score}/${quizzes[id].length}</strong>. ${score === quizzes[id].length ? 'Excelente dominio del tema.' : 'Puedes repasar las tarjetas y volver a intentarlo.'}</p><button class="btn primary small" id="again${id}">Reintentar</button>`;
            document.getElementById(`again${id}`).addEventListener('click', () => { index = 0; score = 0; render(); });
          } else render();
        });
      });
    });
  }
  render();
}
mountQuiz(1);
mountQuiz(2);
