    /* ───────── acordeón de módulos + rail lateral ───────── */
    const MOD_TITLES = [
      '¿Tengo un proyecto incubable?',
      '¿A qué modelo pertenece tu proyecto?',
      'Armá tu propuesta',
      'Planificá tu proyecto',
      'Conocé el ecosistema'
    ];
    function updateMobileProgress(idx) {
      const step = document.getElementById('mpStep');
      const title = document.getElementById('mpTitle');
      if (!step || !title) return;
      if (idx === null) {
        step.textContent = '05 módulos';
        title.textContent = 'Tocá un módulo para empezar';
      } else {
        step.textContent = 'Módulo 0' + (idx + 1) + ' de 05';
        title.textContent = MOD_TITLES[idx];
      }
      document.querySelectorAll('.mp-seg').forEach((seg) => {
        const i = Number(seg.dataset.i);
        seg.classList.toggle('fill', idx !== null && i <= idx);
      });
    }
    function toggleModule(idx) {
      const mod = document.querySelector('.acc-mod[data-m="' + idx + '"]');
      const wasOpen = mod.classList.contains('open');
      document.querySelectorAll('.acc-mod').forEach(m => m.classList.remove('open'));
      document.querySelectorAll('.rail-item').forEach(r => r.classList.remove('active'));
      if (!wasOpen) {
        mod.classList.add('open');
        document.querySelector('.rail-item[data-m="' + idx + '"]').classList.add('active');
        mod.scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateMobileProgress(idx);
      } else {
        updateMobileProgress(null);
      }
    }
    function openFromNav(idx) {
      const mod = document.querySelector('.acc-mod[data-m="' + idx + '"]');
      if (!mod.classList.contains('open')) toggleModule(idx);
      else mod.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ───────── checklist toggle + estado "completo" en el rail + descargas ───────── */
    function toggleChk(el) {
      el.classList.toggle('on');
      el.querySelector('input').checked = el.classList.contains('on');
      updRail();
      updateDownloads();
    }
    function updRail() {
      document.querySelectorAll('.acc-mod').forEach((mod) => {
        const i = mod.dataset.m;
        const boxes = mod.querySelectorAll('.chk-item');
        const done = mod.querySelectorAll('.chk-item.on').length;
        const r = document.querySelector('.rail-item[data-m="' + i + '"]');
        if (r) r.classList.toggle('done', boxes.length > 0 && done === boxes.length);
      });
    }
    function updateDownloads() {
      for (let i = 0; i < 5; i++) {
        const ent = document.getElementById('ent-m' + i);
        if (!ent) continue;
        const boxes = ent.querySelectorAll('.chk-item');
        const done = ent.querySelectorAll('.chk-item.on').length;
        const complete = boxes.length > 0 && done === boxes.length;
        const btn = document.getElementById('dl-' + i);
        const hint = document.getElementById('dl-hint-' + i);
        if (btn) btn.disabled = !complete;
        if (hint) hint.textContent = complete ? 'Descarga habilitada — todos los entregables están completos.' : 'Completá los ' + boxes.length + ' casilleros para habilitar la descarga.';
      }
    }

    /* ───────── construcción de datos + descarga JSON por módulo ─────────
       Para editar QUÉ se incluye en el archivo descargado, modificá el objeto
       que devuelve cada función buildM{n}Data() de abajo: agregá, sacá o
       renombrá claves según lo que necesites en el JSON final. */
    function val(id) { const e = document.getElementById(id); return e ? e.value : ''; }
    function entregablesEstado(idx) {
      const ent = document.getElementById('ent-m' + idx);
      return [...ent.querySelectorAll('.chk-item')].map(c => ({
        item: c.querySelector('span').textContent,
        completado: c.classList.contains('on')
      }));
    }
    function buildM0Data() {
      return {
        modulo: '01 - Exploración del proyecto',
        checklist_caracteristicas: CHECKLIST.map((c, i) => ({ criterio: c.criterio, estado: chkAnswers[i] > 0 ? CHK_LV_NAMES[chkAnswers[i] - 1] : null })),
        test_autoevaluacion: M1Q.map((q, i) => ({ pregunta: q.q, respuesta: m1Answers[i] !== null ? q.opts[m1Answers[i]] : null })),
        ficha_idea_inicial: { nombre: val('f1-nombre'), descripcion: val('f1-desc'), problema: val('f1-prob') },
        entregables: entregablesEstado(0)
      };
    }
    function buildM1Data() {
      return {
        modulo: '02 - Elegí tu camino',
        arbol_decision: M2Q.map((q, i) => ({ pregunta: q.q, respuesta: m2Answers[i] !== null ? q.opts[m2Answers[i]] : null })),
        modelo_sugerido: m2SuggestedIdx > -1 ? (MODELOS[m2SuggestedIdx].n + ' — ' + MODELOS[m2SuggestedIdx].t) : null,
        modelo_elegido: m2Chosen !== null ? (MODELOS[m2Chosen].n + ' — ' + MODELOS[m2Chosen].t) : null,
        justificacion: val('m2-justificacion'),
        entregables: entregablesEstado(1)
      };
    }
    function buildM2Data() {
      const rubrica = RUBRICA.map((r, i) => ({
        criterio: r.criterio,
        puntaje: rubAnswers[i],
        nivel: rubAnswers[i] > 0 ? RUB_LV_NAMES[rubAnswers[i] - 1] : null,
        referencia: rubAnswers[i] > 0 ? r.niveles[rubAnswers[i] - 1] : null
      }));
      const canvasData = (fields) => Object.fromEntries(fields.map(f => [f.area, val(f.id)]));
      return {
        modulo: '03 - Herramientas de propuesta',
        canvas_ppp: canvasData(CANVAS_PPP),
        canvas_tif: canvasData(CANVAS_TIF),
        rubrica_autoevaluacion: rubrica,
        rubrica_total: rubrica.reduce((s, r) => s + r.puntaje, 0) + ' / ' + (RUBRICA.length * 4),
        entregables: entregablesEstado(2)
      };
    }
    function buildM3Data() {
      const cron = [...document.querySelectorAll('#m4-cron .row-line')].map(r => {
        const i = r.querySelectorAll('input'); return { hito: i[0].value, fecha: i[1].value, responsable: i[2].value };
      });
      const raci = [...document.querySelectorAll('#m4-raci .row-line')].map(r => {
        const i = r.querySelectorAll('input'); const s = r.querySelector('select');
        return { integrante: i[0].value, tarea: i[1].value, rol: s.value };
      });
      const pres = [...document.querySelectorAll('#m4-pres .row-line')].map(r => {
        const i = r.querySelectorAll('input'); return { item: i[0].value, monto: Number(i[1].value || 0), fuente: i[2].value };
      });
      return {
        modulo: '04 - Gestión y viabilidad',
        cronograma: cron,
        matriz_raci: raci,
        presupuesto: pres,
        presupuesto_total: pres.reduce((s, p) => s + p.monto, 0),
        triple_impacto: {
          social: Number(document.getElementById('m4-soc').value),
          ambiental: Number(document.getElementById('m4-amb').value),
          economico: Number(document.getElementById('m4-eco').value),
          total: Number(document.getElementById('m4-soc').value) + Number(document.getElementById('m4-amb').value) + Number(document.getElementById('m4-eco').value)
        },
        entregables: entregablesEstado(3)
      };
    }
    function buildM4Data() {
      const mapaActores = getActorMapData();
      const contactos = [...document.querySelectorAll('#m5-contacts .actor-card')].map(c => {
        const i = c.querySelectorAll('input'); const s = c.querySelector('select');
        return { nombre: i[0].value, vinculo: s.value, rol: i[1].value };
      });
      return {
        modulo: '05 - Ecosistema de recursos',
        mapa_actores: mapaActores,
        red_contactos: contactos,
        entregables: entregablesEstado(4)
      };
    }
    const BUILDERS = [buildM0Data, buildM1Data, buildM2Data, buildM3Data, buildM4Data];
    /* ───────── descarga en PDF de todo el contenido de un módulo ─────────
       Reutiliza los datos de BUILDERS[idx]() (los mismos que antes armaban
       el JSON) y los renderiza como documento imprimible. Para cambiar
       cómo se ve cada tipo de dato, ajustá renderVal() más abajo. */
    function labelize(k) {
      return k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    function escPdf(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }
    function renderVal(v) {
      if (v === null || v === undefined || v === '') return '<span class="pdf-empty">—</span>';
      if (Array.isArray(v)) {
        if (v.length === 0) return '<span class="pdf-empty">—</span>';
        if (typeof v[0] === 'object' && v[0] !== null) {
          if ('completado' in v[0]) {
            return '<div class="pdf-chklist">' + v.map(it => `<div class="pdf-chk">${it.completado ? '☑' : '☐'} ${escPdf(it.item)}</div>`).join('') + '</div>';
          }
          return '<div class="pdf-cards">' + v.map(it =>
            '<div class="pdf-card">' + Object.entries(it).map(([k, val]) => `<span class="pdf-k">${labelize(k)}:</span> ${escPdf(val)}`).join(' &nbsp;·&nbsp; ') + '</div>'
          ).join('') + '</div>';
        }
        return '<ul class="pdf-ul">' + v.map(x => `<li>${escPdf(x)}</li>`).join('') + '</ul>';
      }
      if (typeof v === 'object') {
        return '<div class="pdf-obj">' + Object.entries(v).map(([k, val]) =>
          `<div class="pdf-row"><span class="pdf-k">${labelize(k)}</span><div class="pdf-v">${renderVal(val)}</div></div>`
        ).join('') + '</div>';
      }
      return `<span>${escPdf(v)}</span>`;
    }
    function downloadModulePDF(idx) {
      const data = BUILDERS[idx]();
      const title = data.modulo;
      let sections = '';
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'modulo') return;
        sections += `<div class="pdf-section"><h3>${labelize(k)}</h3>${renderVal(v)}</div>`;
      });

      const doc = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    @page{ size:A4 portrait; margin:18mm; }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'JetBrains Mono',monospace;color:#0A0A0A;font-size:11px;line-height:1.6}
    .pdf-banner{background:#0A0A0A;color:#fff;padding:16px 20px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:baseline}
    .pdf-banner .t{font-size:16px;font-weight:800;text-transform:uppercase}
    .pdf-banner .s{font-size:9px;color:#A6FBE0;text-transform:uppercase;letter-spacing:.06em}
    .pdf-section{border:1px solid #0A0A0A;margin-bottom:14px;page-break-inside:avoid}
    .pdf-section h3{background:#A6FBE0;color:#0A0A0A;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:8px 14px;border-bottom:1px solid #0A0A0A}
    .pdf-section > *:not(h3){padding:12px 14px}
    .pdf-empty{color:#999}
    .pdf-chklist{padding:10px 14px}
    .pdf-chk{padding:3px 0;font-size:11px}
    .pdf-cards{padding:10px 14px;display:flex;flex-direction:column;gap:8px}
    .pdf-card{border-left:2px solid #A6FBE0;padding:4px 10px;font-size:10.5px}
    .pdf-k{font-weight:700}
    .pdf-ul{padding:10px 14px 10px 26px}
    .pdf-ul li{margin-bottom:4px}
    .pdf-obj{padding:10px 14px}
    .pdf-row{display:grid;grid-template-columns:170px 1fr;gap:10px;padding:6px 0;border-bottom:1px solid #eee}
    .pdf-row:last-child{border-bottom:none}
    .pdf-row .pdf-k{font-size:9.5px;text-transform:uppercase;color:#555}
    .pdf-foot{font-size:8.5px;color:#888;margin-top:10px;text-transform:uppercase;letter-spacing:.05em}
  </style></head>
  <body>
    <div class="pdf-banner">
      <span class="t">${title}</span>
      <span class="s">Guía del Estudiante</span>
    </div>
    ${sections}
    <p class="pdf-foot">HUB DI UNLa · Registro de módulo · ${new Date().toLocaleDateString('es-AR')}</p>
  </body></html>`;

      const win = window.open('', '_blank');
      win.document.open();
      win.document.write(doc);
      win.document.close();
      win.onload = () => setTimeout(() => win.print(), 400);
    }

    /* ───────── Business Model Canvas: switch + descarga PDF ─────────
       Para editar los campos de cada canvas (etiquetas, ayudas, orden),
       modificá los arrays CANVAS_PPP / CANVAS_TIF de abajo. Cada objeto
       es un bloque: id (debe existir como textarea en el HTML), label,
       area (posición en la grilla) y tint (t1 a t5, intensidad de menta). */
    function switchCanvas(type) {
      document.getElementById('bmc-sw-ppp').classList.toggle('on', type === 'ppp');
      document.getElementById('bmc-sw-tif').classList.toggle('on', type === 'tif');
      document.getElementById('bmc-panel-ppp').classList.toggle('on', type === 'ppp');
      document.getElementById('bmc-panel-tif').classList.toggle('on', type === 'tif');
    }

    const CANVAS_PPP = [
      { id: 'bmc-ppp-actores', label: 'Actores clave', area: 'socios', tint: 't5' },
      { id: 'bmc-ppp-actividades', label: 'Actividades de la práctica', area: 'actividades', tint: 't3' },
      { id: 'bmc-ppp-recursos', label: 'Recursos clave', area: 'recursos', tint: 't1' },
      { id: 'bmc-ppp-valor', label: 'Propuesta de valor para la organización', area: 'valor', tint: 't2' },
      { id: 'bmc-ppp-vinculo', label: 'Vínculo con la organización', area: 'relaciones', tint: 't4' },
      { id: 'bmc-ppp-entrega', label: 'Entrega y comunicación de resultados', area: 'canales', tint: 't3' },
      { id: 'bmc-ppp-destinatario', label: 'Destinatario dentro de la organización', area: 'segmento', tint: 't5' },
      { id: 'bmc-ppp-tiempos', label: 'Recursos y tiempos de la práctica', area: 'costos', tint: 't2' },
      { id: 'bmc-ppp-resultado', label: 'Resultado esperado de la práctica', area: 'ingresos', tint: 't5' },
    ];
    const CANVAS_TIF = [
      { id: 'bmc-tif-actores', label: 'Actores clave', area: 'socios', tint: 't5' },
      { id: 'bmc-tif-actividades', label: 'Actividades del proyecto', area: 'actividades', tint: 't3' },
      { id: 'bmc-tif-recursos', label: 'Recursos clave', area: 'recursos', tint: 't1' },
      { id: 'bmc-tif-propuesta', label: 'Propuesta de valor del proyecto', area: 'valor', tint: 't2' },
      { id: 'bmc-tif-validacion', label: 'Validación con el usuario', area: 'relaciones', tint: 't4' },
      { id: 'bmc-tif-difusion', label: 'Difusión y comunicación', area: 'canales', tint: 't3' },
      { id: 'bmc-tif-usuario', label: 'Usuario / destinatario', area: 'segmento', tint: 't5' },
      { id: 'bmc-tif-costos', label: 'Recursos y costos del proyecto', area: 'costos', tint: 't2' },
      { id: 'bmc-tif-resultados', label: 'Resultados y evaluación esperada', area: 'ingresos', tint: 't5' },
    ];
    const CANVAS_TITLES = { ppp: 'Modelo de Proyecto — Adaptado a PPP', tif: 'Modelo de Proyecto — Adaptado a TIF' };

    /* habilita el botón "Descargar PDF" de cada canvas recién cuando los 9 bloques están completos */
    function checkCanvasComplete(type) {
      const fields = type === 'ppp' ? CANVAS_PPP : CANVAS_TIF;
      const done = fields.filter(f => (document.getElementById(f.id).value || '').trim().length > 0).length;
      const complete = done === fields.length;
      const btn = document.getElementById('dlc-' + type);
      const hint = document.getElementById('dlc-hint-' + type);
      if (btn) btn.disabled = !complete;
      if (hint) hint.textContent = complete ? 'Descarga habilitada — completaste los 9 bloques.' : 'Completá los 9 bloques para habilitar la descarga (' + done + ' / ' + fields.length + ').';
    }

    function downloadCanvasPDF(type) {
      const fields = type === 'ppp' ? CANVAS_PPP : CANVAS_TIF;
      const title = CANVAS_TITLES[type];
      const blocksHTML = fields.map(f => {
        const v = (document.getElementById(f.id).value || '').replace(/</g, '&lt;').replace(/\n/g, '<br>');
        return `<div class="bmc-block ${f.tint}" style="grid-area:${f.area}">
      <h4>${f.label}</h4>
      <div class="val">${v || '<span class=\"empty\">—</span>'}</div>
    </div>`;
      }).join('');

      const doc = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    @page{ size:A4 landscape; margin:14mm; }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'JetBrains Mono',monospace;color:#0A0A0A}
    .bmc-wrap{border:1px solid #0A0A0A}
    .bmc-banner{background:#A6FBE0;color:#0A0A0A;font-size:22px;font-weight:800;text-transform:uppercase;padding:14px 20px;border-bottom:1px solid #0A0A0A}
    .bmc-grid{display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:auto auto auto;
      grid-template-areas:"socios actividades valor relaciones segmento" "socios recursos valor canales segmento" "costos costos costos ingresos ingresos";}
    .bmc-block{border-right:1px solid #0A0A0A;border-bottom:1px solid #0A0A0A;padding:12px;min-height:130px}
    .bmc-block:nth-last-child(-n+2){border-bottom:none}
    .bmc-grid>.bmc-block:last-child{border-right:none}
    .bmc-block h4{font-size:10.5px;font-weight:800;text-transform:uppercase;margin-bottom:6px;line-height:1.25}
    .bmc-block .val{font-size:10px;line-height:1.5}
    .bmc-block .empty{color:#999}
    .t1{background:#FFFFFF}
    .t2{background:rgba(166,251,224,.35)}
    .t3{background:rgba(166,251,224,.6)}
    .t4{background:#F5F4EF}
    .t5{background:#A6FBE0}
    .foot{font-size:8.5px;color:#888;margin-top:8px;text-transform:uppercase;letter-spacing:.05em}
  </style></head>
  <body>
    <div class="bmc-wrap">
      <div class="bmc-banner">${title}</div>
      <div class="bmc-grid">${blocksHTML}</div>
    </div>
    <p class="foot">HUB DI UNLa · Guía del estudiante · ${new Date().toLocaleDateString('es-AR')}</p>
  </body></html>`;

      const win = window.open('', '_blank');
      win.document.open();
      win.document.write(doc);
      win.document.close();
      win.onload = () => setTimeout(() => win.print(), 400);
    }

    /* ───────── tabs ───────── */
    function swTabsGeneric(groupBtn, idx) {
      const tabsWrap = groupBtn.parentElement;
      const block = tabsWrap.parentElement;
      [...tabsWrap.children].forEach((b, i) => b.classList.toggle('on', i === idx));
      [...block.querySelectorAll('.tscreen')].forEach((s, i) => s.classList.toggle('on', i === idx));
    }

    /* ───────── MÓDULO 1: checklist de características ───────── */
    const CHECKLIST = [
      { criterio: 'Pertinencia', hint: '¿Responde a una necesidad real y concreta, no solo a una tendencia?' },
      { criterio: 'Proceso de diseño', hint: '¿Tenés un diagnóstico o investigación que lo sustente, aunque esté abierto a ajustes?' },
      { criterio: 'Viabilidad técnica', hint: '¿Es producible con tecnologías y recursos disponibles?' },
      { criterio: 'Viabilidad económica', hint: '¿Existe (aunque sea en borrador) una idea de modelo de negocio o cadena de valor?' },
      { criterio: 'Valor diferencial y sustentabilidad', hint: '¿Es innovador o replicable, y considera su impacto ambiental/social?' },
      { criterio: 'Motivación del equipo', hint: '¿Hay ganas reales de seguir desarrollándolo?' }
    ];
    const CHK_LV_NAMES = ['Todavía no', 'En proceso', 'Resuelto'];
    let chkAnswers = new Array(CHECKLIST.length).fill(0);
    function buildChecklist() {
      const c = document.getElementById('m1-checklist');
      c.innerHTML = CHECKLIST.map((item, ci) => `
    <div class="chk2-item">
      <div class="chk2-head">
        <p class="chk2-q">${ci + 1}. ${item.criterio}</p>
        <p class="chk2-hint">${item.hint}</p>
      </div>
      <div class="chk2-opts">
        ${CHK_LV_NAMES.map((name, li) => `
          <button type="button" class="chk2opt" id="chk2opt-${ci}-${li + 1}" onclick="selChk(${ci},${li + 1})">${name}</button>`).join('')}
      </div>
    </div>`).join('');
    }
    function selChk(critIdx, level) {
      chkAnswers[critIdx] = level;
      for (let li = 1; li <= 3; li++) {
        document.getElementById('chk2opt-' + critIdx + '-' + li).classList.toggle('sel', li === level);
      }
      updChkTotal();
    }
    function updChkTotal() {
      const answered = chkAnswers.filter(v => v > 0).length;
      if (answered === 0) { document.getElementById('m1-chk-total').textContent = 'Sin completar'; return; }
      const resueltos = chkAnswers.filter(v => v === 3).length;
      const proceso = chkAnswers.filter(v => v === 2).length;
      const falta = chkAnswers.filter(v => v === 1).length;
      document.getElementById('m1-chk-total').textContent = resueltos + ' resueltos · ' + proceso + ' en proceso · ' + falta + ' todavía no';
    }
    buildChecklist();
    document.querySelectorAll('#m1 .tool-tabs .ttab').forEach((b, i) => b.onclick = () => swTabsGeneric(b, i));

    /* ───────── MÓDULO 1: quiz autoevaluación ───────── */
    const M1Q = [
      { q: '¿Podés explicar tu idea en una sola frase?', opts: ['Sí, clara y concreta', 'Más o menos', 'Todavía no'] },
      { q: '¿Identificaste a quién le sirve este proyecto?', opts: ['Sí, sé exactamente a quién', 'Tengo una idea aproximada', 'No lo pensé todavía'] },
      { q: '¿Tu proyecto está vinculado a tu carrera de diseño?', opts: ['Sí, directamente', 'Parcialmente', 'No estoy seguro/a'] },
      { q: '¿Ya armaste algún boceto, prototipo o maqueta?', opts: ['Sí', 'Tengo bocetos en papel', 'Todavía no'] },
      { q: '¿Sabés en qué se diferencia tu proyecto de algo que ya existe?', opts: ['Sí, tengo claro el diferencial', 'Tengo una intuición', 'No lo investigué'] }
    ];
    function buildM1() {
      const c = document.getElementById('m1-quiz');
      let h = '';
      M1Q.forEach((item, qi) => {
        h += '<p style="font-size:12.5px;font-weight:700;margin:14px 0 8px">' + (qi + 1) + '. ' + item.q + '</p>';
        item.opts.forEach((o, oi) => {
          h += '<button class="qopt" data-q="' + qi + '" data-o="' + oi + '" onclick="selM1(this,' + qi + ',' + oi + ')">' + o + '</button>';
        });
      });
      c.innerHTML = h;
    }
    let m1Answers = Array(M1Q.length).fill(null);
    function selM1(btn, qi, oi) {
      document.querySelectorAll('.qopt[data-q="' + qi + '"]').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      m1Answers[qi] = oi;
      if (m1Answers.every(a => a !== null)) showM1Result();
    }
    function showM1Result() {
      const score = m1Answers.reduce((s, a) => s + (2 - a), 0); // 0=mejor opción=2pts
      let msg, title;
      if (score >= 8) { title = 'Tu idea está lista para avanzar'; msg = 'Tenés buena claridad sobre el problema, el usuario y el diferencial. Pasá al módulo 02 para elegir tu camino dentro de la incubadora.'; }
      else if (score >= 4) { title = 'Vas en buen camino, conviene afinar algunos puntos'; msg = 'Repasá el Cap. 1 y 2 del manual y completá la ficha de idea inicial antes de avanzar — eso te va a ayudar a ordenar lo que todavía está difuso.'; }
      else { title = 'Todavía es pronto para incubar, y está bien'; msg = 'Tomate un tiempo más para definir problema, usuario y diferencial. La ficha de idea inicial de abajo te puede servir como punto de partida.'; }
      document.getElementById('m1-result').innerHTML = '<div class="result-box"><p class="rt">Resultado</p><p class="rm">' + title + '</p><p>' + msg + '</p></div>';
    }
    buildM1();

    /* ───────── MÓDULO 2: árbol de decisión + modelos ───────── */
    const M2Q = [
      { q: '¿En qué etapa está tu proyecto?', opts: ['Es una idea / exploración', 'Tengo una propuesta definida'] },
      { q: '¿Ya identificaste una convocatoria a la que aplicar?', opts: ['Sí', 'No, todavía no'] },
      { q: '¿Tu objetivo es validar académicamente o salir al mercado?', opts: ['Validar académicamente', 'Salir al mercado'] },
    ];
    let m2Answers = Array(M2Q.length).fill(null);
    function buildM2() {
      const c = document.getElementById('m2-quiz');
      let h = '';
      M2Q.forEach((item, qi) => {
        h += '<p style="font-size:12.5px;font-weight:700;margin:14px 0 8px">' + (qi + 1) + '. ' + item.q + '</p>';
        item.opts.forEach((o, oi) => {
          h += '<button class="qopt" data-q="' + qi + '" data-o="' + oi + '" onclick="selM2(this,' + qi + ',' + oi + ')">' + o + '</button>';
        });
      });
      c.innerHTML = h;
    }
    function selM2(btn, qi, oi) {
      document.querySelectorAll('#m2-quiz .qopt[data-q="' + qi + '"]').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      m2Answers[qi] = oi;
      if (m2Answers.every(a => a !== null)) showM2Result();
    }
    const MODELOS = [
      { n: 'Modelo 1', t: 'Concurso', d: ['Proyecto en etapa de exploración', 'Sin convocatoria identificada todavía'], avanzado: false },
      { n: 'Modelo 2', t: 'Convocatorias', d: ['Idea con cierto desarrollo', 'Buscás financiamiento externo'], avanzado: false },
      { n: 'Modelo 3', t: 'Código abierto', d: ['Querés que el proyecto sea colaborativo', 'Validación académica como prioridad'], avanzado: false },
      { n: 'Modelo 4', t: 'Emprendimiento', d: ['Propuesta definida', 'Pensás en salir al mercado'], avanzado: true },
      { n: 'Modelo 5', t: 'Llave en mano', d: ['Proyecto avanzado y validado', 'Buscás un partner para producir/escalar'], avanzado: true },
      { n: 'Modelo 6', t: 'Lanzamiento', d: ['Producto o servicio listo', 'Foco en salida comercial inmediata'], avanzado: true },
    ];
    let m2SuggestedIdx = -1;
    let m2Chosen = null;
    function showM2Result() {
      const exploracion = m2Answers[0] === 0;
      const mercado = m2Answers[2] === 1;
      let idx = exploracion ? (mercado ? 0 : 2) : (mercado ? 5 : 3);
      const suggested = MODELOS[idx];
      document.getElementById('m2-result').innerHTML = '<div class="result-box"><p class="rt">Punto de partida sugerido</p><p class="rm">' + suggested.n + ' — ' + suggested.t + '</p><p>Es un punto de partida, no una obligación. Compará los 6 modelos abajo antes de decidir.</p></div>';
      m2SuggestedIdx = idx;
      renderModelos(idx);
    }
    function renderModelos(suggestedIdx) {
      const c = document.getElementById('m2-models');
      c.innerHTML = MODELOS.map((m, i) => `
    <div class="mcard ${i === suggestedIdx ? 'suggested' : ''} ${i === m2Chosen ? 'chosen' : ''}" onclick="chooseModelo(${i})">
      <span class="mchosen-tag">✓ Elegido</span>
      <p class="mn">${m.n} ${m.avanzado ? '· Avanzado' : '· Inicial'}</p>
      <p class="mt">${m.t}</p>
      <ul>${m.d.map(x => '<li>' + x + '</li>').join('')}</ul>
    </div>`).join('');
    }
    function chooseModelo(i) {
      m2Chosen = i;
      renderModelos(m2SuggestedIdx);
      const m = MODELOS[i];
      document.getElementById('m2-selected-note').textContent = 'Modelo elegido: ' + m.n + ' — ' + m.t + '.';
    }
    buildM2();
    renderModelos(-1);

    /* ───────── MÓDULO 3 ───────── */
    document.querySelectorAll('#m3 .tool-tabs .ttab').forEach((b, i) => b.onclick = () => swTabsGeneric(b, i));
    checkCanvasComplete('ppp');
    checkCanvasComplete('tif');
    const RUBRICA = [
      {
        criterio: 'Claridad del problema identificado', niveles: [
          'El problema no está definido o es muy vago.',
          'El problema está mencionado, pero sin datos ni contexto que lo sustenten.',
          'El problema está bien definido y se entiende a quién afecta.',
          'El problema está definido con datos o evidencia que demuestran su relevancia.'
        ]
      },
      {
        criterio: 'Solidez de la solución propuesta', niveles: [
          'No hay una solución concreta, solo una idea general.',
          'La solución está esbozada, pero no se explica cómo funciona.',
          'La solución es concreta y se entiende cómo resuelve el problema.',
          'La solución está fundamentada y se anticipan sus principales desafíos.'
        ]
      },
      {
        criterio: 'Conocimiento del usuario/destinatario', niveles: [
          'No se identificó quién usa o se beneficia del proyecto.',
          'Se menciona un usuario genérico, sin caracterización.',
          'Se describe un usuario/destinatario concreto con sus necesidades.',
          'Hay evidencia (entrevistas, encuestas, testeo) sobre el usuario real.'
        ]
      },
      {
        criterio: 'Diferenciación respecto a alternativas existentes', niveles: [
          'No se investigaron alternativas o proyectos similares.',
          'Se mencionan alternativas, pero sin una comparación clara.',
          'Se identifican alternativas y se explica en qué se diferencia el proyecto.',
          'La diferenciación es clara, específica y constituye una ventaja real.'
        ]
      },
      {
        criterio: 'Viabilidad técnica', niveles: [
          'No está claro si el proyecto se puede construir o ejecutar.',
          'Hay una idea de cómo hacerlo, pero sin definir recursos ni pasos.',
          'Se identificaron los recursos y pasos técnicos necesarios.',
          'Ya se probó una versión (prototipo/maqueta/piloto) o hay un plan técnico detallado.'
        ]
      },
      {
        criterio: 'Viabilidad económica', niveles: [
          'No hay estimación de costos ni de cómo se financiaría el proyecto.',
          'Hay una idea aproximada de costos, sin desglose ni fuentes.',
          'Se estimaron los costos principales y posibles fuentes de financiamiento.',
          'Hay un presupuesto desglosado y fuentes de financiamiento identificadas.'
        ]
      },
      {
        criterio: 'Impacto esperado', niveles: [
          'No se planteó qué impacto tendría el proyecto.',
          'Se menciona un impacto general, sin especificar a quién ni cómo.',
          'Se describe el impacto esperado (social/ambiental/económico) de forma concreta.',
          'El impacto está dimensionado (a cuántas personas, en qué medida) y es medible.'
        ]
      },
      {
        criterio: 'Pertinencia con la convocatoria elegida', niveles: [
          'No se revisaron los requisitos de la convocatoria.',
          'Se conoce la convocatoria, pero el proyecto no encaja del todo.',
          'El proyecto se ajusta a los requisitos y objetivos de la convocatoria.',
          'El proyecto está diseñado específicamente para maximizar su ajuste a la convocatoria.'
        ]
      },
      {
        criterio: 'Calidad de la comunicación de la propuesta', niveles: [
          'La propuesta es difícil de entender o está incompleta.',
          'La propuesta se entiende, pero con lenguaje impreciso o desordenado.',
          'La propuesta es clara, ordenada y usa un lenguaje adecuado.',
          'La propuesta es clara, atractiva y persuasiva: lista para presentar.'
        ]
      },
      {
        criterio: 'Nivel de avance del prototipo o evidencia', niveles: [
          'Todavía no hay ningún avance concreto, solo la idea.',
          'Hay bocetos o pruebas muy iniciales.',
          'Hay un prototipo, maqueta o evidencia concreta que se puede mostrar.',
          'El prototipo fue testeado con usuarios reales y ajustado según feedback.'
        ]
      }
    ];
    const RUB_LV_NAMES = ['Incipiente', 'En desarrollo', 'Logrado', 'Destacado'];
    let rubAnswers = new Array(RUBRICA.length).fill(0);
    function buildRubrica() {
      const c = document.getElementById('m3-rubrica');
      c.innerHTML = RUBRICA.map((r, ci) => `
    <div class="rub-item">
      <div class="rub-crit-head">
        <span class="rub-crit-title"><span class="rub-crit-num">${ci + 1}.</span>${r.criterio}</span>
        <span class="rub-crit-score empty" id="rub-score-${ci}">Sin elegir</span>
      </div>
      <div class="rub-opts">
        ${r.niveles.map((desc, li) => `
          <button type="button" class="rubopt" id="rubopt-${ci}-${li + 1}" onclick="selRub(${ci},${li + 1})">
            <span class="rub-lv">${li + 1}</span>
            <span class="rub-lv-name">${RUB_LV_NAMES[li]}</span>
            <span class="rub-desc">${desc}</span>
          </button>`).join('')}
      </div>
    </div>`).join('');
    }
    function selRub(critIdx, level) {
      rubAnswers[critIdx] = level;
      for (let li = 1; li <= 4; li++) {
        document.getElementById('rubopt-' + critIdx + '-' + li).classList.toggle('sel', li === level);
      }
      const scoreEl = document.getElementById('rub-score-' + critIdx);
      scoreEl.textContent = level + ' / 4 · ' + RUB_LV_NAMES[level - 1];
      scoreEl.classList.remove('empty');
      updRubrica();
    }
    function updRubrica() {
      const total = rubAnswers.reduce((s, v) => s + v, 0);
      document.getElementById('m3-total').textContent = total + ' / ' + (RUBRICA.length * 4);
    }
    buildRubrica();

    const PITCH = [
      { b: 'Apertura', t: '30 seg', d: 'Quién sos y una frase que enganche.' },
      { b: 'Problema', t: '45 seg', d: 'Qué problema real estás resolviendo.' },
      { b: 'Solución', t: '60 seg', d: 'Cómo lo resuelve tu proyecto.' },
      { b: 'Equipo', t: '30 seg', d: 'Quiénes son y por qué son los indicados.' },
      { b: 'Pedido', t: '30 seg', d: 'Qué necesitás de la incubadora puntualmente.' },
      { b: 'Cierre', t: '15 seg', d: 'Una frase de síntesis memorable.' },
    ];
    document.getElementById('m3-pitch').innerHTML = PITCH.map((p, i) => `
  <div class="refbox"><p class="cap">${i + 1}. ${p.b} — ${p.t}</p><p>${p.d}</p></div>`).join('');

    /* ───────── MÓDULO 4 ───────── */
    document.querySelectorAll('#m4 .tool-tabs .ttab').forEach((b, i) => b.onclick = () => swTabsGeneric(b, i));

    function addCronRow() {
      const c = document.getElementById('m4-cron');
      const row = document.createElement('div');
      row.className = 'row-line';
      row.style.gridTemplateColumns = '2fr 1fr 1fr 24px';
      row.innerHTML = '<input type="text" placeholder="Hito"><input type="date"><input type="text" placeholder="Responsable"><button class="del" onclick="this.parentElement.remove()">×</button>';
      c.appendChild(row);
    }
    addCronRow(); addCronRow(); addCronRow();

    function addRaciRow() {
      const c = document.getElementById('m4-raci');
      const row = document.createElement('div');
      row.className = 'row-line';
      row.style.gridTemplateColumns = '1.5fr 1fr 1fr 24px';
      row.innerHTML = '<input type="text" placeholder="Nombre"><input type="text" placeholder="Tarea"><select><option value="">—</option><option>R</option><option>A</option><option>C</option><option>I</option></select><button class="del" onclick="this.parentElement.remove()">×</button>';
      c.appendChild(row);
    }
    addRaciRow(); addRaciRow();

    function addPresRow() {
      const c = document.getElementById('m4-pres');
      const row = document.createElement('div');
      row.className = 'row-line';
      row.style.gridTemplateColumns = '2fr 1fr 1fr 24px';
      row.innerHTML = '<input type="text" placeholder="Ítem"><input type="number" placeholder="0" oninput="updPresTotal()"><input type="text" placeholder="Propio / convocatoria"><button class="del" onclick="this.parentElement.remove();updPresTotal()">×</button>';
      c.appendChild(row);
    }
    function updPresTotal() {
      let total = 0;
      document.querySelectorAll('#m4-pres input[type=number]').forEach(i => total += Number(i.value || 0));
      document.getElementById('m4-total').textContent = '$ ' + total.toLocaleString('es-AR');
    }
    addPresRow(); addPresRow();

    function updImpacto() {
      const s = Number(document.getElementById('m4-soc').value);
      const a = Number(document.getElementById('m4-amb').value);
      const e = Number(document.getElementById('m4-eco').value);
      document.getElementById('m4-soc-v').textContent = s;
      document.getElementById('m4-amb-v').textContent = a;
      document.getElementById('m4-eco-v').textContent = e;
      const total = s + a + e;
      document.getElementById('m4-imp-total').textContent = total + ' / 15';
      let msg = 'Movés los sliders para estimar el impacto de tu proyecto en cada dimensión.';
      if (total >= 11) msg = 'Buen equilibrio de impacto en las 3 dimensiones — es un punto fuerte para tu propuesta.';
      else if (total >= 5) msg = 'Hay impacto en algunas dimensiones. Pensá si podés reforzar la que quedó más baja.';
      document.getElementById('m4-imp-msg').textContent = msg;
    }

    function toggleAcc(btn) {
      btn.classList.toggle('open');
      btn.nextElementSibling.classList.toggle('show');
    }

    /* ───────── MÓDULO 5: mapa de actores (4 zonas) ─────────
       Para editar las zonas (nombres, ayudas, orden) modificá el array
       ACTOR_ZONES de abajo. Cada zona necesita un id que coincida con
       el "grid-area" (z-inc, z-doc, z-inst, z-par) usado en el HTML. */
    const ACTOR_ZONES = [
      { id: 'inc', label: 'Incubadora / HUB' },
      { id: 'doc', label: 'Docentes y tutores' },
      { id: 'inst', label: 'Instituciones y aliados' },
      { id: 'par', label: 'Pares y comunidad' },
    ];
    function addActorTo(zone) {
      const c = document.getElementById('zlist-' + zone);
      const row = document.createElement('div');
      row.className = 'actor-row';
      row.innerHTML = `<input type="text" class="ae-nombre" placeholder="Nombre">
    <input type="text" class="ae-rol" placeholder="Rol / contacto">
    <button class="del" onclick="this.parentElement.remove()">×</button>`;
      c.appendChild(row);
    }
    // arranca con una fila cargada en cada zona
    ACTOR_ZONES.forEach(z => addActorTo(z.id));

    function getActorMapData() {
      const data = {};
      ACTOR_ZONES.forEach(z => {
        data[z.id] = [...document.querySelectorAll('#zlist-' + z.id + ' .actor-row')]
          .map(r => ({ nombre: r.querySelector('.ae-nombre').value, rol_contacto: r.querySelector('.ae-rol').value }))
          .filter(a => a.nombre || a.rol_contacto);
      });
      return data;
    }

    function downloadActorMapPDF() {
      const data = getActorMapData();
      const zoneHTML = ACTOR_ZONES.map((z, i) => {
        const tint = ['t5', 't3', 't2', 't4'][i];
        const items = data[z.id];
        const rows = items.length
          ? items.map(a => `<div class="am-row"><strong>${(a.nombre || '—').replace(/</g, '&lt;')}</strong>${a.rol_contacto ? ' — ' + a.rol_contacto.replace(/</g, '&lt;') : ''}</div>`).join('')
          : '<div class="am-row empty">— sin cargar —</div>';
        return `<div class="am-block ${tint}" style="grid-area:${'z-' + z.id}"><h4>${z.label}</h4>${rows}</div>`;
      }).join('');

      const doc = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Mapa de Actores del Proyecto</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    @page{ size:A4 portrait; margin:16mm; }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'JetBrains Mono',monospace;color:#0A0A0A}
    .am-wrap{border:1px solid #0A0A0A}
    .am-banner{background:#A6FBE0;color:#0A0A0A;font-size:22px;font-weight:800;text-transform:uppercase;padding:14px 20px;border-bottom:1px solid #0A0A0A}
    .am-grid{display:grid;grid-template-columns:1fr 1fr;grid-template-areas:"z-inc z-doc" "z-inst z-par"}
    .am-block{border-right:1px solid #0A0A0A;border-bottom:1px solid #0A0A0A;padding:16px;min-height:150px}
    .am-grid .am-block:nth-child(2n){border-right:none}
    .am-grid .am-block:nth-child(n+3){border-bottom:none}
    .am-block h4{font-size:12px;font-weight:800;text-transform:uppercase;margin-bottom:10px}
    .am-row{font-size:10.5px;line-height:1.8}
    .am-row.empty{color:#999}
    .t1{background:#FFFFFF}.t2{background:rgba(166,251,224,.35)}.t3{background:rgba(166,251,224,.6)}.t4{background:#F5F4EF}.t5{background:#A6FBE0}
    .foot{font-size:8.5px;color:#888;margin-top:8px;text-transform:uppercase;letter-spacing:.05em}
  </style></head>
  <body>
    <div class="am-wrap">
      <div class="am-banner">Mapa de Actores del Proyecto</div>
      <div class="am-grid">${zoneHTML}</div>
    </div>
    <p class="foot">HUB DI UNLa · Guía del estudiante · ${new Date().toLocaleDateString('es-AR')}</p>
  </body></html>`;

      const win = window.open('', '_blank');
      win.document.open();
      win.document.write(doc);
      win.document.close();
      win.onload = () => setTimeout(() => win.print(), 400);
    }

    function addContact() {
      const c = document.getElementById('m5-contacts');
      const card = document.createElement('div');
      card.className = 'actor-card';
      card.innerHTML = `<div class="actor-top">
      <input type="text" placeholder="Nombre completo" style="flex:2">
      <select style="flex:1"><option value="mentor">Mentor/a</option><option value="alumni">Alumni</option><option value="aliado">Aliado/a</option><option value="evaluador">Evaluador/a</option></select>
    </div>
    <div style="display:flex;gap:8px"><input type="text" placeholder="Rol o por qué puede ayudarte" style="flex:1"><button class="del" onclick="this.closest('.actor-card').remove()">×</button></div>`;
      c.appendChild(card);
    }
    addContact();

    const FONDOS = [
      { n: 'Fondos nacionales de ciencia y tecnología', m: '[Completar monto]', req: 'Proyectos con componente de innovación o I+D. Requisitos y convocatorias varían según el organismo.', tags: ['Nacional'] },
      { n: 'Premios de diseño industrial', m: '[Completar monto]', req: 'Convocatorias anuales abiertas a estudiantes y egresados recientes de diseño.', tags: ['Premio'] },
      { n: 'Programas de diseño de organismos públicos', m: '[Completar monto]', req: 'Apoyo a proyectos con potencial de desarrollo productivo.', tags: ['Público'] },
      { n: 'Consultoras y fundaciones de apoyo a emprendedores', m: '[Completar monto]', req: 'Acompañamiento y a veces financiamiento para proyectos en etapa temprana.', tags: ['Privado'] },
      { n: 'Convocatorias internas de la incubadora', m: 'Variable', req: 'Específicas del HUB — consultalas directamente con el equipo.', tags: ['Interno'] },
    ];
    document.getElementById('m5-fin').innerHTML = FONDOS.map((f, i) => `
  <div class="acc-item">
    <button class="acc-trig" onclick="toggleAcc(this)"><span class="at">${f.n}</span><span class="am">${f.m}</span></button>
    <div class="acc-body"><p style="margin-bottom:8px">${f.req}</p><div class="chips">${f.tags.map(t => '<span class="chip">' + t + '</span>').join('')}</div></div>
  </div>`).join('');

    const GLOSARIO = [
      { a: 'TIF', d: 'Trabajo Integrador Final. Proyecto de cierre de carrera.' },
      { a: 'PPP', d: 'Práctica Profesional / Proyecto. Instancia de aplicación real durante la cursada.' },
      { a: 'MVP', d: 'Producto Mínimo Viable: la versión más simple de tu proyecto que ya se puede probar con usuarios reales.' },
      { a: 'Pitch', d: 'Presentación breve y persuasiva de tu proyecto, generalmente de 3 a 5 minutos.' },
      { a: 'Canvas', d: 'Herramienta visual de una página para estructurar una propuesta de valor.' },
      { a: 'Triple impacto', d: 'Medición del impacto social, ambiental y económico de un proyecto.' },
      { a: 'Incubadora', d: 'Espacio que acompaña proyectos en etapa temprana con mentoría, recursos y red de contactos.' },
    ];
    function renderGlos(list) {
      document.getElementById('m5-glos').innerHTML = list.map(g => `
    <div class="glos-item"><span class="glos-abbr">${g.a}</span><span class="glos-def">${g.d}</span></div>`).join('');
    }
    function filterGlos(q) {
      renderGlos(GLOSARIO.filter(g => g.a.toLowerCase().includes(q.toLowerCase()) || g.d.toLowerCase().includes(q.toLowerCase())));
    }
    renderGlos(GLOSARIO);
    updateDownloads();
