 const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const l1 = 12, l2 = 12;
    let q1 = Math.PI / 2, q2 = Math.PI / 2;
    let target = { x: 10, y: 10 };

    function dibujarRobot(q1, q2) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(10, -10);

      const x1 = l1 * Math.cos(q1);
      const y1 = l1 * Math.sin(q1);
      const x2 = x1 + l2 * Math.cos(q1 + q2);
      const y2 = y1 + l2 * Math.sin(q1 + q2);

      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, l1 + l2, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x2, y2, 0.5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    }

    function ik(x, y) {
      const r = Math.sqrt(x*x + y*y);
      if (r > l1 + l2) return null;
      const c2 = (x*x + y*y - l1*l1 - l2*l2) / (2*l1*l2);
      const s2 = Math.sqrt(1 - c2*c2);
      const q2 = Math.atan2(s2, c2);
      const q1 = Math.atan2(y, x) - Math.atan2(l2*s2, l1 + l2*c2);
      return [q1, q2];
    }

    document.getElementById('moveBtn').onclick = () => {
      const x = parseFloat(document.getElementById('xd').value);
      const y = parseFloat(document.getElementById('yd').value);
      const res = ik(x, y);
      if (!res) return alert('Fuera del espacio de trabajo');
      [q1, q2] = res;
      target = {x, y};
      dibujarRobot(q1, q2);
    };

    document.getElementById('homeBtn').onclick = () => {
      q1 = Math.PI / 2;
      q2 = Math.PI / 2;
      dibujarRobot(q1, q2);
    };

    function trayectoria(q1f, q2f) {
      const T = 20;
      const t = Array.from({length: 50}, (_,i)=>i*T/50);
      const q1t = t.map(tt => q1 + (q1f - q1)*(10*(tt/T)**3 - 15*(tt/T)**4 + 6*(tt/T)**5));
      const q2t = t.map(tt => q2 + (q2f - q2)*(10*(tt/T)**3 - 15*(tt/T)**4 + 6*(tt/T)**5));
      return {t,q1t,q2t};
    }

    const chart = new Chart(document.getElementById('qPlot'), {
      type: 'line',
      data: { labels: [], datasets: [
        { label: 'q1(t)', borderColor: '#0ea5e9', data: [] },
        { label: 'q2(t)', borderColor: '#f59e0b', data: [] }
      ] },
      options: { responsive: true, scales: { y: { beginAtZero: false } } }
    });

    document.getElementById('trajBtn').onclick = () => {
      const x = parseFloat(document.getElementById('xd').value);
      const y = parseFloat(document.getElementById('yd').value);
      const res = ik(x, y);
      if (!res) return alert('Fuera del espacio de trabajo');
      const {t, q1t, q2t} = trayectoria(res[0], res[1]);
      chart.data.labels = t.map(v=>v.toFixed(1));
      chart.data.datasets[0].data = q1t;
      chart.data.datasets[1].data = q2t;
      chart.update();
      let i = 0;
      const anim = setInterval(()=>{
        dibujarRobot(q1t[i], q2t[i]);
        i++;
        if (i>=q1t.length) clearInterval(anim);
      },100);
    };

    dibujarRobot(q1,q2);