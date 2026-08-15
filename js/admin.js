// ── ESTILOS DINÁMICOS SIN unsafe-inline ──
// Las plantillas ya no escriben style="..." (el CSP lo bloquearía sin
// 'unsafe-inline'): escriben data-css="..." y este observador lo vuelca a
// el.style.cssText, que entra por el CSSOM y el CSP sí permite. Corre como
// microtarea al final de cada render, antes del pintado, así que el
// elemento nunca se alcanza a ver sin su estilo.
(function(){
  function aplicar(el){
    if(el.nodeType!==1)return;
    if(el.hasAttribute('data-css'))el.style.cssText=el.getAttribute('data-css');
    el.querySelectorAll('[data-css]').forEach(n=>{n.style.cssText=n.getAttribute('data-css');});
  }
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(aplicar)))
    .observe(document.documentElement,{childList:true,subtree:true});
  aplicar(document.documentElement);
})();

    const API_URL = 'https://gladiadores-backend.vercel.app';
    let token = null;
    let tempToken = null;
    let currentReservaId = null;
    let reservasCache = [];
    let userRole = null;

    const UNIT_IMAGES = {
      'cuatrimoto': 'img/i18.png',
      'cuatrimoto-2': 'img/i18.png',
      'commander-2': 'img/unidades/commander-2p.avif',
      'commander-4': 'img/unidades/commander-4p.avif',
      'maverick-2': 'img/unidades/maverick-x3-rs-2p.avif',
      'maverick-4': 'img/unidades/maverick-x3-max-4p.avif'
    };

    function esc(s) {
      if (s == null) return '';
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function checkSession() {
      token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length !== 3) throw new Error('bad token');
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('admin_token');
            token = null;
            return;
          }
          loadPanel();
        } catch (e) {
          localStorage.removeItem('admin_token');
          token = null;
        }
      }
    }

    async function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');
      if (!email || !password) { errorDiv.textContent = 'Completa email y contraseña'; return; }

      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.ok && data.requiere2FA) {
          tempToken = data.tempToken;
          document.getElementById('login').style.display = 'none';
          document.getElementById('paso-2fa').style.display = 'block';
          document.getElementById('codigo-2fa').focus();
        } else if (data.ok && data.token) {
          token = data.token;
          localStorage.setItem('admin_token', token);
          loadPanel();
        } else {
          errorDiv.textContent = data.error || 'Error al autenticar';
        }
      } catch (err) {
        errorDiv.textContent = 'Error de conexión';
      }
    }

    async function verificar2FA() {
      const codigo = document.getElementById('codigo-2fa').value.trim();
      const err = document.getElementById('error-2fa');
      err.textContent = '';
      if (!codigo) { err.textContent = 'Escribe el código'; return; }

      try {
        const res = await fetch(`${API_URL}/api/auth/login/2fa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempToken, codigo })
        });
        const data = await res.json();
        if (data.ok && data.token) {
          token = data.token;
          tempToken = null;
          localStorage.setItem('admin_token', token);
          document.getElementById('paso-2fa').style.display = 'none';
          loadPanel();
        } else {
          err.textContent = data.error || 'Código incorrecto';
          document.getElementById('codigo-2fa').value = '';
        }
      } catch (e) {
        err.textContent = 'Error de conexión';
      }
    }

    async function loadPanel() {
      document.getElementById('login').style.display = 'none';
      document.getElementById('panel').style.display = 'block';

      const payload = JSON.parse(atob(token.split('.')[1]));
      document.getElementById('admin-name').textContent = payload.email;
      userRole = payload.role;

      if (payload.role === 'owner') {
        document.getElementById('tab-btn-agente').style.display = '';
        document.getElementById('tab-btn-promos').style.display = '';
      }

      loadReservas();
      startPolling();
    }

    /* ===== RESERVAS ===== */
    // El panel se refresca solo mientras la pestaña está visible y no hay un
    // modal abierto (para no jalarle la tabla al dueño mientras está viendo
    // el detalle de una reserva). No es websockets — es un jalón cada rato,
    // suficiente para que el panel nunca se sienta viejo.
    let pollTimer = null;
    function startPolling() {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        if (document.hidden) return;
        if (document.getElementById('modal').classList.contains('open')) return;
        if (document.getElementById('tab-reservas').classList.contains('active')) loadReservas();
        else if (document.getElementById('tab-flotilla').classList.contains('active') && calSelected) cargarFlotilla(calSelected);
      }, 20000);
    }

    async function loadReservas() {
      try {
        const res = await fetch(`${API_URL}/api/reservas`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.ok && data.reservas) {
          reservasCache = data.reservas;
          renderReservas(data.reservas);
          const marca = document.getElementById('reservas-actualizado');
          if (marca) marca.textContent = 'actualizado a las ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        } else {
          document.getElementById('tbody-reservas').innerHTML = `<tr><td colspan="7" data-css="color:#ff6b6b">${esc(data.error || 'Error')}</td></tr>`;
        }
      } catch (err) {
        document.getElementById('tbody-reservas').innerHTML = '<tr><td colspan="7" data-css="color:#ff6b6b">Error de conexión</td></tr>';
      }
    }

function renderReservas(reservas) {
      const tbody = document.getElementById('tbody-reservas');
      if (!reservas.length) { tbody.innerHTML = '<tr><td colspan="7" data-css="color:#777;text-align:center">Sin reservas</td></tr>'; return; }
      tbody.innerHTML = reservas.map((r, idx) => `
        <tr>
          <td><b>${esc(r.folio)}</b></td>
          <td>${esc(r.cliente?.nombre)}</td>
          <td>${esc(r.ruta)}</td>
          <td>${new Date(r.fecha).toLocaleDateString('es-MX')}</td>
          <td>$${esc(String(r.monto))}${r.modoPago === 'anticipo' ? ` <span class="pago-pill anticipo">anticipo · falta $${esc(String((r.montoTotal || r.monto) - r.monto))}</span>` : ` <span class="pago-pill completo">completo</span>`}</td>
          <td><span class="estado-badge estado-${esc(r.estado)}">${esc(r.estado)}</span></td>
          <td><button class="btn-action sm secondary" data-a="openModalByIdx" data-p="${idx}">Ver</button></td>
        </tr>
      `).join('');
    }

    // Descarga todas las reservas cargadas como CSV, para que el dueño se
    // lleve su propia copia y no dependa solo de lo que viva en Mongo.
    // Se pide la lista completa al servidor (no solo lo que ya está en
    // caché) para que el CSV siempre sea el respaldo más reciente.
    async function exportarReservasCSV(btn) {
      if (btn) { btn.disabled = true; btn.textContent = 'Descargando...'; }
      try {
        const res = await fetch(`${API_URL}/api/reservas`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (!data.ok || !data.reservas) throw new Error(data.error || 'No se pudo descargar');
        const filas = data.reservas;

        const encabezados = ['Folio','Nombre','Email','WhatsApp','Ruta','Fecha','Horario','Unidad','Personas','Monto Pagado','Monto Total','Modo Pago','Estado','Creada'];
        const csvEscape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lineas = [encabezados.map(csvEscape).join(',')];
        filas.forEach(r => {
          lineas.push([
            r.folio,
            r.cliente?.nombre,
            r.cliente?.email,
            r.cliente?.whatsapp,
            r.ruta,
            new Date(r.fecha).toLocaleDateString('es-MX'),
            r.horario,
            r.unidad,
            r.personas,
            r.monto,
            r.montoTotal,
            r.modoPago,
            r.estado,
            new Date(r.creadaEn).toLocaleString('es-MX')
          ].map(csvEscape).join(','));
        });

        const csv = '﻿' + lineas.join('\r\n'); // BOM para que Excel abra bien los acentos
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const hoy = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `reservas-gladiadores-${hoy}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('No se pudo descargar el CSV: ' + err.message);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = '⬇ Descargar CSV'; }
      }
    }

    function openModalByIdx(idx) {
      const r = reservasCache[idx];
      if (!r) return;
      openModal(r.folio, r);
    }

    function openModal(id, reserva) {
      currentReservaId = id;
      const body = document.getElementById('modal-body');
      const falta = (reserva.montoTotal || reserva.monto) - reserva.monto;
      body.innerHTML = `
        <div class="modal-detail"><b>Folio:</b> ${esc(reserva.folio)}</div>
        <div class="modal-detail"><b>Cliente:</b> ${esc(reserva.cliente?.nombre)}</div>
        <div class="modal-detail"><b>Email:</b> ${esc(reserva.cliente?.email)}</div>
        <div class="modal-detail"><b>WhatsApp:</b> <a href="https://wa.me/52${esc(reserva.cliente?.whatsapp)}" target="_blank" data-css="color:#4caf50">${esc(reserva.cliente?.whatsapp)}</a></div>
        <div class="modal-detail"><b>Ruta:</b> ${esc(reserva.ruta)} · ${new Date(reserva.fecha).toLocaleDateString('es-MX')} · ${esc(reserva.horario)}</div>
        <div class="modal-detail"><b>Unidad:</b> ${esc(reserva.unidad)}</div>
        <div class="modal-detail"><b>Personas:</b> ${esc(String(reserva.personas ?? '—'))}</div>
        <div class="modal-detail"><b>Pago:</b> ${reserva.modoPago === 'completo'
          ? `$${esc(String(reserva.monto))} (completo)`
          : `Anticipo $${esc(String(reserva.monto))} de $${esc(String(reserva.montoTotal || reserva.monto))} · falta $${esc(String(falta))}`}</div>
        <div class="modal-detail"><b>Estado:</b> <span class="estado-badge estado-${esc(reserva.estado)}">${esc(reserva.estado)}</span></div>
      `;
      document.getElementById('estado-select').value = reserva.estado;
      document.getElementById('modal').classList.add('open');
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('open');
      currentReservaId = null;
    }

    async function changeEstado(event) {
      const nuevoEstado = event.target.value;
      if (!nuevoEstado || !currentReservaId) return;
      if (!['confirmada','cancelada','completada','no_show'].includes(nuevoEstado)) return;

      try {
        const res = await fetch(`${API_URL}/api/reservas/${encodeURIComponent(currentReservaId)}/estado`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await res.json();
        if (data.ok) { closeModal(); loadReservas(); }
      } catch (err) {
        alert('Error al actualizar estado');
      }
    }
    document.getElementById('estado-select').addEventListener('change', changeEstado);

    /* ===== TABS ===== */
    let catalogoCache = [];

    function switchTab(nombre) {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === nombre));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + nombre));
      if (nombre === 'catalogo' && catalogoCache.length === 0) loadCatalogo();
      if (nombre === 'seguridad') loadSeguridad();
      if (nombre === 'agente') loadAgente();
      if (nombre === 'promos') loadPromos();
      if (nombre === 'flotilla') { renderCalendar(); }
    }

    /* ===== FLOTILLA / CALENDARIO ===== */
    const NOMBRE_TIPO = { cuatrimoto: 'Cuatrimotos', commander: 'Commanders', maverick: 'Mavericks' };
    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const DIAS_SEM = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    let calYear = new Date().getFullYear();
    let calMonth = new Date().getMonth();
    let calSelected = null;
    let calReservasDots = {};

    function calNav(dir) { calMonth += dir; if (calMonth > 11) { calMonth = 0; calYear++; } if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); }

    async function loadCalendarDots() {
      if (!reservasCache.length) { try { await loadReservas(); } catch (e) {} }
      calReservasDots = {};
      reservasCache.forEach(r => {
        if (r.estado === 'cancelada') return;
        const f = new Date(r.fecha).toISOString().slice(0, 10);
        calReservasDots[f] = (calReservasDots[f] || 0) + 1;
      });
    }

    async function renderCalendar() {
      await loadCalendarDots();
      drawCalendar();
    }

    function drawCalendar() {
      const grid = document.getElementById('cal-grid');
      document.getElementById('cal-title').textContent = MESES[calMonth] + ' ' + calYear;
      const hoy = new Date().toISOString().slice(0, 10);
      const primerDia = new Date(calYear, calMonth, 1);
      let diaInicio = primerDia.getDay();
      diaInicio = diaInicio === 0 ? 6 : diaInicio - 1;
      const diasEnMes = new Date(calYear, calMonth + 1, 0).getDate();
      let html = DIAS_SEM.map(d => `<div class="cal-dow">${d}</div>`).join('');
      for (let i = 0; i < diaInicio; i++) html += '<div class="cal-day empty"></div>';
      for (let d = 1; d <= diasEnMes; d++) {
        const iso = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const clases = ['cal-day'];
        if (iso === hoy) clases.push('today');
        if (iso === calSelected) clases.push('selected');
        if (iso < hoy) clases.push('past');
        if (calReservasDots[iso]) clases.push('has-reservas');
        html += `<div class="${clases.join(' ')}" data-a="calSelectDay" data-p="${iso}">${d}</div>`;
      }
      grid.innerHTML = html;
    }

    function calSelectDay(iso) {
      calSelected = iso;
      const label = document.getElementById('cal-fecha-label');
      const parts = iso.split('-');
      label.textContent = `${parseInt(parts[2])} de ${MESES[parseInt(parts[1])-1]} ${parts[0]}`;
      label.style.display = 'block';
      drawCalendar();
      cargarFlotilla(iso);
    }

    async function cargarFlotilla(fecha) {
      const cuerpo = document.getElementById('flotilla-cuerpo');
      if (!fecha) { cuerpo.innerHTML = '<p data-css="color:#777">Selecciona un día del calendario</p>'; return; }
      cuerpo.innerHTML = '<p data-css="color:#777">Consultando...</p>';
      try {
        const res = await fetch(`${API_URL}/api/disponibilidad?fecha=${fecha}`);
        const data = await res.json();
        if (!data.ok) { cuerpo.textContent = data.error || 'No se pudo consultar'; return; }
        renderFlotilla(data.todas || []);
      } catch (err) {
        cuerpo.textContent = 'Error de conexión';
      }
    }

    function renderFlotilla(todas) {
      const cuerpo = document.getElementById('flotilla-cuerpo');
      const libres = todas.filter(u => u.libre).length;
      const grupos = {};
      todas.forEach(u => { (grupos[u.tipo] = grupos[u.tipo] || []).push(u); });

      const resumen = `<p data-css="color:#999;margin-bottom:1rem">
        <b data-css="color:#4caf50">${libres} libres</b> de ${todas.length} unidades ese día
      </p>`;

      const bloques = Object.entries(grupos).map(([tipo, lista]) => `
        <div class="flotilla-tipo">${NOMBRE_TIPO[tipo] || tipo}</div>
        ${lista.map(u => {
          const tipoId = tipo === 'cuatrimoto' ? 'cuatrimoto' : `${tipo}-${u.plazas || 4}`;
          const imgSrc = UNIT_IMAGES[tipoId] || '';
          return `<div class="flotilla-unit">
            ${u.numero ? `<span class="fu-num">${esc(String(u.numero))}</span>` : ''}
            ${imgSrc ? `<img src="${esc(imgSrc)}" alt="${esc(u.apodo)}" data-onerr="hide">` : ''}
            <div class="fu-name">
              <b>${esc(u.apodo)}</b>
              <small>${esc(u.nombreCompleto)}${!u.activo ? ' · mantenimiento' : ''}</small>
            </div>
            <div>
              ${u.libre
                ? '<span class="switch on" data-css="cursor:default">Libre</span>'
                : `<span class="switch off" data-css="cursor:default">${u.activo ? 'Ocupada' : 'Fuera de servicio'}</span>`}
            </div>
            <div class="fu-info">
              ${u.ocupacion ? `${esc(u.ocupacion.folio)} · ${esc(u.ocupacion.ruta)}` : ''}
            </div>
          </div>`;
        }).join('')}
      `).join('');

      cuerpo.innerHTML = resumen + bloques;
    }

    /* ===== PROMOS ===== */
    let promosCache = [];

    async function loadPromos() {
      const lista = document.getElementById('promos-lista');
      try {
        const res = await fetch(`${API_URL}/api/admin/promos`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.ok) { promosCache = data.promos; renderPromos(); }
        else lista.textContent = data.error || 'Error';
      } catch (e) {
        lista.textContent = 'Error de conexión';
      }
    }

    function renderPromos() {
      const lista = document.getElementById('promos-lista');
      if (!promosCache.length) { lista.innerHTML = '<p data-css="color:#777">No hay códigos promocionales. Crea uno arriba.</p>'; return; }

      lista.innerHTML = '<div class="promo-grid">' + promosCache.map(p => {
        const ahora = new Date();
        const fin = new Date(p.vigenciaFin);
        const inicio = new Date(p.vigenciaInicio);
        const expirado = fin < ahora;
        const agotado = p.usosActuales >= p.usosMaximos;
        const pendiente = inicio > ahora;

        let estado = '';
        if (!p.activo) estado = '<span data-css="color:#ff6b6b">Desactivado</span>';
        else if (expirado) estado = '<span data-css="color:#ff6b6b">Expirado</span>';
        else if (agotado) estado = '<span data-css="color:#ff9800">Agotado</span>';
        else if (pendiente) estado = '<span data-css="color:#2196f3">Pendiente</span>';
        else estado = '<span data-css="color:#4caf50">Activo</span>';

        return `<div class="promo-card ${expirado || agotado ? 'expired' : ''}">
          <div class="promo-code">${esc(p.codigo)}</div>
          <div class="promo-detail">
            <b>${p.porcentaje}% de descuento</b>
            <small>${inicio.toLocaleDateString('es-MX')} — ${fin.toLocaleDateString('es-MX')}</small>
          </div>
          <div class="promo-stats">
            <b>${p.usosActuales} / ${p.usosMaximos}</b>
            <small>usos</small>
          </div>
          <div>${estado}</div>
          <div data-css="display:flex;gap:6px">
            <button class="btn-action sm ${p.activo ? 'danger' : 'secondary'}" data-a="togglePromo" data-p="${esc(p._id)}|${!p.activo}">${p.activo ? 'Desactivar' : 'Activar'}</button>
            <button class="btn-action sm danger" data-a="eliminarPromo" data-p="${esc(p._id)}">Eliminar</button>
          </div>
        </div>`;
      }).join('') + '</div>';
    }

    async function crearPromo() {
      const errEl = document.getElementById('promo-error');
      errEl.textContent = '';
      const body = {
        codigo: document.getElementById('promo-codigo').value,
        porcentaje: document.getElementById('promo-porcentaje').value,
        usosMaximos: document.getElementById('promo-usos').value,
        vigenciaInicio: document.getElementById('promo-inicio').value,
        vigenciaFin: document.getElementById('promo-fin').value
      };
      if (!body.codigo || !body.porcentaje || !body.usosMaximos || !body.vigenciaInicio || !body.vigenciaFin) {
        errEl.textContent = 'Completa todos los campos'; return;
      }
      try {
        const res = await fetch(`${API_URL}/api/admin/promos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.ok) {
          document.getElementById('promo-codigo').value = '';
          document.getElementById('promo-porcentaje').value = '';
          document.getElementById('promo-usos').value = '';
          loadPromos();
        } else {
          errEl.textContent = data.error || 'Error al crear código';
        }
      } catch (e) {
        errEl.textContent = 'Error de conexión';
      }
    }

    async function togglePromo(id, activo) {
      try {
        await fetch(`${API_URL}/api/admin/promos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ activo })
        });
        loadPromos();
      } catch (e) { alert('Error de conexión'); }
    }

    async function eliminarPromo(id) {
      if (!confirm('¿Eliminar este código? No se puede deshacer.')) return;
      try {
        await fetch(`${API_URL}/api/admin/promos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        loadPromos();
      } catch (e) { alert('Error de conexión'); }
    }

    /* ===== AGENTE IA ===== */
    async function loadAgente() {
      const c = document.getElementById('agente-cuerpo');
      c.innerHTML = '<p data-css="color:#777">Cargando...</p>';
      try {
        const res = await fetch(`${API_URL}/api/admin/agente`, { headers: { 'Authorization': `Bearer ${token}` } });
        const d = await res.json();
        if (!d.ok) { c.textContent = d.error || 'No se pudo cargar'; return; }
        renderAgente(d.config);
      } catch (e) { c.textContent = 'Error de conexión'; }
    }

    function renderAgente(config) {
      document.getElementById('agente-cuerpo').innerHTML = `
        <div class="card">
          <div class="card-top">
            <div>
              <div class="card-name">${config.activo ? 'Agente activo' : 'Agente apagado'}</div>
              <div class="card-meta">${config.activo ? 'Responde en el chat del sitio.' : 'El chat cae directo a WhatsApp mientras esté apagado.'}</div>
            </div>
            <button class="switch ${config.activo ? 'on' : 'off'}" data-a="toggleAgente" data-p="${!config.activo}">${config.activo ? 'Apagar' : 'Encender'}</button>
          </div>
        </div>
        <div class="card" data-css="margin-top:0.75rem">
          <label data-css="display:block;color:#999;font-size:0.82rem;margin-bottom:0.6rem">
            Instrucciones adicionales (promociones vigentes, tono, cosas que no debe decir).
          </label>
          <textarea id="agente-instrucciones" rows="6" maxlength="2000"
            data-css="width:100%;background:#222428;border:1px solid #333;border-radius:10px;padding:0.8rem;color:#E8E8E8;font-family:inherit;font-size:0.88rem;resize:vertical"
            placeholder="Ej: Este fin de semana hay 15% de descuento en Ruta del Río. No ofrezcas descuentos que no estén aquí.">${esc(config.instrucciones || '')}</textarea>
          <div data-css="margin-top:0.8rem;display:flex;align-items:center;gap:12px">
            <button class="btn-action" data-a="guardarInstruccionesAgente">Guardar</button>
            <span id="agente-guardado" class="saved" data-css="opacity:0"></span>
          </div>
        </div>`;
    }

    async function toggleAgente(nuevoValor) {
      try {
        const res = await fetch(`${API_URL}/api/admin/agente`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ activo: nuevoValor })
        });
        const d = await res.json();
        if (d.ok) renderAgente(d.config);
        else alert(d.error || 'No se pudo actualizar');
      } catch (e) { alert('Error de conexión'); }
    }

    async function guardarInstruccionesAgente() {
      const instrucciones = document.getElementById('agente-instrucciones').value;
      try {
        const res = await fetch(`${API_URL}/api/admin/agente`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ instrucciones })
        });
        const d = await res.json();
        if (!d.ok) { alert(d.error || 'No se pudo guardar'); return; }
        const aviso = document.getElementById('agente-guardado');
        aviso.textContent = 'Guardado';
        aviso.style.opacity = 1;
        setTimeout(() => { aviso.style.opacity = 0; }, 2000);
      } catch (e) { alert('Error de conexión'); }
    }

    /* ===== SEGURIDAD / 2FA ===== */
    async function loadSeguridad() {
      const c = document.getElementById('seguridad-cuerpo');
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (!data.ok) { c.textContent = 'No se pudo cargar'; return; }
        renderSeguridad(data.admin.totpActivo);
      } catch (e) { c.textContent = 'Error de conexión'; }
    }

    function renderSeguridad(activo) {
      document.getElementById('seguridad-cuerpo').innerHTML = activo
        ? `<div class="card">
             <div class="card-top">
               <div>
                 <div class="card-name">Segundo factor activo</div>
                 <div class="card-meta">Tu cuenta pide un código además de la contraseña.</div>
               </div>
               <button class="switch off" data-a="desactivar2FA">Desactivar</button>
             </div>
           </div>`
        : `<div class="card">
             <div class="card-top">
               <div>
                 <div class="card-name">Segundo factor desactivado</div>
                 <div class="card-meta">Tu cuenta solo está protegida por la contraseña.</div>
               </div>
               <button class="btn-action" data-a="preparar2FA">Activar ahora</button>
             </div>
           </div>`;
    }

    async function preparar2FA() {
      const c = document.getElementById('seguridad-cuerpo');
      c.innerHTML = '<p data-css="color:#777">Generando código...</p>';
      try {
        const res = await fetch(`${API_URL}/api/auth/2fa/preparar`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await res.json();
        if (!d.ok) { c.textContent = d.error || 'Error'; return; }

        c.innerHTML = `<div class="card">
          <div class="card-name" data-css="margin-bottom:1rem">Escanea este código</div>
          <p data-css="color:#999;font-size:0.88rem;margin-bottom:1rem">
            Ábrelo con Google Authenticator, Authy o 1Password. Si no puedes escanear,
            usa esta clave: <code data-css="color:#FF7A00;letter-spacing:0.1em">${esc(d.secret)}</code>
          </p>
          <img src="${esc(d.qr)}" alt="Código QR" data-css="border-radius:10px;background:#fff;padding:8px">
          <div data-css="margin-top:1.2rem;max-width:320px">
            <label data-css="display:block;color:#999;font-size:0.82rem;margin-bottom:0.5rem">
              Escribe el código que aparece en la app
            </label>
            <div data-css="display:flex;gap:8px">
              <input class="precio-input" id="codigo-activar" maxlength="6" inputmode="numeric"
                     placeholder="000000" data-css="width:130px;text-align:center;letter-spacing:0.2em">
              <button class="btn-action" data-a="activar2FA">Confirmar</button>
            </div>
            <div id="error-activar" class="error"></div>
          </div>
        </div>`;
      } catch (e) { c.textContent = 'Error de conexión'; }
    }

    async function activar2FA() {
      const codigo = document.getElementById('codigo-activar').value.trim();
      const err = document.getElementById('error-activar');
      err.textContent = '';
      if (!codigo) { err.textContent = 'Escribe el código'; return; }

      try {
        const res = await fetch(`${API_URL}/api/auth/2fa/activar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ codigo })
        });
        const d = await res.json();
        if (!d.ok) { err.textContent = d.error || 'Código incorrecto'; return; }

        document.getElementById('seguridad-cuerpo').innerHTML = `<div class="card">
          <div class="card-name" data-css="color:#4caf50">Segundo factor activado</div>
          <p data-css="color:#999;font-size:0.88rem;margin:0.8rem 0">
            Guarda estos códigos de respaldo. Sirven una sola vez cada uno
            y son tu única forma de entrar si pierdes el teléfono.
            <b data-css="color:#FF7A00">No se volverán a mostrar.</b>
          </p>
          <div data-css="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin:1rem 0">
            ${d.codigosRespaldo.map(c => `<code data-css="background:#222428;border:1px solid #333;padding:0.5rem;border-radius:6px;text-align:center;color:#E8E8E8;letter-spacing:0.06em">${esc(c)}</code>`).join('')}
          </div>
          <button class="btn-action" data-a="copiarCodigos" data-codigos="${esc(d.codigosRespaldo.join('\n'))}">Copiar códigos</button>
          <button class="btn-action secondary" data-css="margin-left:8px" data-a="renderSeguridad" data-p="true">Ya los guardé</button>
        </div>`;
      } catch (e) {
        err.textContent = 'Error de conexión';
      }
    }

    function copiarCodigos(btn) {
      navigator.clipboard.writeText(btn.dataset.codigos).then(() => {
        btn.textContent = 'Copiados';
        setTimeout(() => { btn.textContent = 'Copiar códigos'; }, 2000);
      });
    }

    async function desactivar2FA() {
      const password = prompt('Confirma tu contraseña para desactivar el segundo factor:');
      if (!password) return;
      try {
        const res = await fetch(`${API_URL}/api/auth/2fa/desactivar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ password })
        });
        const d = await res.json();
        if (d.ok) renderSeguridad(false);
        else alert(d.error || 'No se pudo desactivar');
      } catch (e) { alert('Error de conexión'); }
    }

    /* ===== CATÁLOGO ===== */
    async function loadCatalogo() {
      const cont = document.getElementById('catalogo-lista');
      try {
        const res = await fetch(`${API_URL}/api/catalogo/admin`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.ok && data.rutas) { catalogoCache = data.rutas; renderCatalogo(); }
        else { cont.textContent = 'Error: ' + (data.error || 'No se pudo cargar'); cont.style.color = '#ff6b6b'; }
      } catch (err) { cont.textContent = 'Error de conexión'; cont.style.color = '#ff6b6b'; }
    }

    function renderCatalogo() {
      document.getElementById('catalogo-lista').innerHTML = catalogoCache.map((r, i) => {
        const horarios = r.horarios.map((h, hi) =>
          `<button class="chip ${h.activo ? '' : 'off'}" data-a="toggleHorario" data-p="${i}|${hi}">${esc(h.hora)}</button>`
        ).join('') || '<span data-css="color:#555;font-size:0.82rem">Sin horarios</span>';

        const unidades = r.units.map((u, ui) => {
          const asientos = Array.from({ length: u.seats }, (_, k) => {
            const n = k + 1;
            const bloqueado = u.booked.includes(n);
            return `<button class="asiento ${bloqueado ? 'off' : ''}" title="${bloqueado ? 'Bloqueado' : 'Libre'}" data-a="toggleAsiento" data-p="${i}|${ui}|${n}">${n}</button>`;
          }).join('');

          return `<div class="unidad-row">
            <div class="unidad-nombre">${esc(u.name)}<small>${esc(u.type)}</small></div>
            <div class="tarifas">
              ${nivelesDe(u).map(n => {
                const t = (u.tarifas || []).find(x => x.personas === n);
                return `<label class="tarifa"><b>${n}p</b>$<input class="precio-input" type="number" min="0" step="50" placeholder="0" value="${t && t.precio ? esc(String(t.precio)) : ''}" data-a="setTarifa" data-p="${i}|${ui}|${n}"></label>`;
              }).join('')}
              <button class="btn-action sm" data-a="guardarPrecio" data-p="${i}|${ui}" title="Guardar tarifas">Guardar</button>
              <span class="saved" id="ok-precio-${i}-${ui}"></span>
              ${(u.tarifas || []).some(t => t.precio > 0) ? '' : '<span class="sin-tarifa">sin precio: no se muestra</span>'}
            </div>
            <div class="asientos">${asientos}</div>
            <button class="switch ${u.activo ? 'on' : 'off'}" data-a="toggleUnidad" data-p="${i}|${ui}">${u.activo ? 'Activa' : 'Apagada'}</button>
          </div>`;
        }).join('');

        return `<div class="card ${r.activo ? '' : 'off'}">
          <div class="card-top">
            <div>
              <div class="card-name">${esc(r.name)}</div>
              <div class="card-meta">${esc(r.diff)} · ${esc(r.dur)} · ${esc(r.dist)}</div>
            </div>
            <div data-css="display:flex;gap:8px;align-items:center">
              <span class="saved" id="ok-${i}"></span>
              <button class="switch ${r.activo ? 'on' : 'off'}" data-a="toggleRuta" data-p="${i}">${r.activo ? 'Publicada' : 'Oculta'}</button>
              <button class="btn-action" id="save-${i}" data-a="guardarRuta" data-p="${i}">Guardar</button>
            </div>
          </div>
          <div class="card-body">
            <div class="bloque-lbl">Fotos (hasta 10) — haz clic en una para hacerla portada</div>
            <div data-css="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:0.8rem">
              ${(r.galeria || []).map((g, gi) => {
                const esPortada = g === r.img;
                return `<div data-css="position:relative;cursor:pointer" data-a="hacerPortada" data-p="${i}|${gi}" title="${esPortada ? 'Esta es la portada' : 'Hacer portada'}">
                  <img src="${esc(g)}" data-onerr="dim" data-css="width:80px;height:60px;object-fit:cover;border-radius:6px;border:2px solid ${esPortada ? '#FF7A00' : '#333'};${esPortada ? 'box-shadow:0 0 8px rgba(255,122,0,0.4)' : ''}">
                  ${esPortada ? '<span data-css="position:absolute;bottom:2px;left:2px;background:#FF7A00;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;letter-spacing:0.05em">PORTADA</span>' : ''}
                  <button data-stop="1" data-a="quitarFotoGaleria" data-p="${i}|${gi}" title="Quitar" data-css="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#ff5a5a;color:#fff;border:none;cursor:pointer;font-size:11px;line-height:1">✕</button>
                </div>`}).join('') || '<span data-css="color:#555;font-size:0.82rem">Sin fotos — sube la primera</span>'}
            </div>
            ${(r.galeria || []).length >= 10
              ? '<p data-css="color:#777;font-size:0.82rem;margin-bottom:0.8rem">Máximo de 10 fotos alcanzado.</p>'
              : `<div data-css="display:flex;gap:8px;margin-bottom:0.8rem;align-items:center">
                  <input type="file" id="file-galeria-${i}" accept="image/*" multiple data-css="display:none" data-a="subirGaleria" data-p="${i}">
                  <button class="btn-action sm secondary" data-a="clickFile" data-p="file-galeria-${i}">Subir fotos</button>
                  <span class="saved" id="ok-subida-${i}"></span>
                </div>`}
            <div data-css="display:flex;gap:8px;align-items:center;margin-bottom:1rem">
              <input type="text" id="video-${i}" class="precio-input" data-css="flex:1;width:auto" placeholder="Liga de YouTube o Instagram (opcional)" value="${esc(r.video || '')}">
              <button class="btn-action sm" data-a="guardarGaleria" data-p="${i}">Guardar video</button>
              <span class="saved" id="ok-gal-${i}"></span>
            </div>

            <div class="bloque-lbl">Horarios</div>
            <div class="chips">${horarios}</div>
            <div data-css="display:flex;gap:8px;margin-top:0.5rem;align-items:center">
              <input type="time" id="nuevo-horario-${i}" class="precio-input" data-css="width:120px">
              <button class="btn-action sm secondary" data-a="agregarHorario" data-p="${i}">Agregar horario</button>
            </div>

            <div class="bloque-lbl" data-css="margin-top:1rem">Días activos</div>
            <p class="card-meta" data-css="margin-bottom:0.5rem">Los clientes solo pueden reservar los días verdes. Toca un día para activar o desactivar.</p>
            <div id="dias-cal-${i}" class="dias-cal"></div>

            <div class="bloque-lbl" data-css="margin-top:1rem">Unidades y asientos</div>
            <p class="card-meta" data-css="margin-bottom:0.8rem">Commander y Maverick de 2 plazas son unidad única: si la apagas aquí, se apaga en todas las rutas.</p>
            ${unidades || '<p data-css="color:#555;font-size:0.82rem">Sin unidades</p>'}
          </div>
        </div>`;
      }).join('');

      catalogoCache.forEach((_, i) => renderDiasCal(i));
    }

    const diasCalMes = {};
    function renderDiasCal(i) {
      const cont = document.getElementById('dias-cal-' + i);
      if (!cont) return;
      if (!diasCalMes[i]) { const d = new Date(); diasCalMes[i] = { y: d.getFullYear(), m: d.getMonth() }; }
      const { y, m } = diasCalMes[i];
      const dias = catalogoCache[i].diasActivos || [];
      const set = new Set(dias);
      const hoyISO = new Date().toISOString().slice(0, 10);
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const first = new Date(y, m, 1);
      const startDow = (first.getDay() + 6) % 7;
      const daysInMonth = new Date(y, m + 1, 0).getDate();

      let html = `<div class="dias-cal-header"><button class="dias-cal-nav" data-a="diasCalNav" data-p="${i}|-1">←</button><span>${meses[m]} ${y}</span><button class="dias-cal-nav" data-a="diasCalNav" data-p="${i}|1">→</button></div>`;
      html += '<div class="dias-cal-grid">';
      ['L','M','X','J','V','S','D'].forEach(d => { html += `<div class="dias-cal-dow">${d}</div>`; });
      for (let e = 0; e < startDow; e++) html += '<div class="dias-cal-day empty"></div>';
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const past = iso < hoyISO;
        const on = set.has(iso);
        html += `<div class="dias-cal-day${on ? ' activo' : ''}${past ? ' past' : ''}" data-a="toggleDia" data-p="${i}|${iso}">${d}</div>`;
      }
      html += '</div>';
      html += `<div class="dias-cal-btns"><button class="btn-action sm secondary" data-a="diasFines" data-p="${i}">+ Fines de semana</button><button class="btn-action sm secondary" data-a="diasTodoMes" data-p="${i}">+ Todo el mes</button><button class="btn-action sm danger" data-a="diasLimpiarMes" data-p="${i}">Limpiar mes</button><button class="btn-action sm" data-a="guardarDias" data-p="${i}">Guardar días</button><span class="saved" id="ok-dias-${i}"></span></div>`;
      cont.innerHTML = html;
    }

    function diasCalNav(i, dir) {
      diasCalMes[i].m += dir;
      if (diasCalMes[i].m > 11) { diasCalMes[i].m = 0; diasCalMes[i].y++; }
      if (diasCalMes[i].m < 0) { diasCalMes[i].m = 11; diasCalMes[i].y--; }
      renderDiasCal(i);
    }

    function toggleDia(i, iso) {
      if (!catalogoCache[i].diasActivos) catalogoCache[i].diasActivos = [];
      const arr = catalogoCache[i].diasActivos;
      const idx = arr.indexOf(iso);
      if (idx === -1) arr.push(iso); else arr.splice(idx, 1);
      arr.sort();
      renderDiasCal(i);
    }

    function diasFines(i) {
      const { y, m } = diasCalMes[i];
      const hoy = new Date().toISOString().slice(0, 10);
      if (!catalogoCache[i].diasActivos) catalogoCache[i].diasActivos = [];
      const set = new Set(catalogoCache[i].diasActivos);
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(y, m, d);
        const dow = dt.getDay();
        if (dow === 0 || dow === 6) {
          const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (iso >= hoy) set.add(iso);
        }
      }
      catalogoCache[i].diasActivos = [...set].sort();
      renderDiasCal(i);
    }

    function diasTodoMes(i) {
      const { y, m } = diasCalMes[i];
      const hoy = new Date().toISOString().slice(0, 10);
      if (!catalogoCache[i].diasActivos) catalogoCache[i].diasActivos = [];
      const set = new Set(catalogoCache[i].diasActivos);
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (iso >= hoy) set.add(iso);
      }
      catalogoCache[i].diasActivos = [...set].sort();
      renderDiasCal(i);
    }

    function diasLimpiarMes(i) {
      const { y, m } = diasCalMes[i];
      const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
      catalogoCache[i].diasActivos = (catalogoCache[i].diasActivos || []).filter(d => !d.startsWith(prefix));
      renderDiasCal(i);
    }

    async function guardarDias(i) {
      const ok = document.getElementById('ok-dias-' + i);
      ok.textContent = '...';
      try {
        await guardarCampoRuta(i, { diasActivos: catalogoCache[i].diasActivos || [] });
        ok.textContent = 'Guardado';
      } catch (err) { ok.textContent = ''; alert(err.message); }
      setTimeout(() => { const el = document.getElementById('ok-dias-' + i); if (el) el.textContent = ''; }, 2500);
    }

    function toggleRuta(i) { catalogoCache[i].activo = !catalogoCache[i].activo; renderCatalogo(); }
    function toggleHorario(i, hi) { catalogoCache[i].horarios[hi].activo = !catalogoCache[i].horarios[hi].activo; renderCatalogo(); }

    function agregarHorario(i) {
      const input = document.getElementById('nuevo-horario-' + i);
      const hora = input.value;
      if (!hora) return;
      if (catalogoCache[i].horarios.some(h => h.hora === hora)) { alert('Ese horario ya existe'); return; }
      catalogoCache[i].horarios.push({ hora, activo: true });
      catalogoCache[i].horarios.sort((a, b) => a.hora.localeCompare(b.hora));
      renderCatalogo();
    }

    function toggleUnidad(i, ui) { catalogoCache[i].units[ui].activo = !catalogoCache[i].units[ui].activo; renderCatalogo(); }
    function toggleAsiento(i, ui, n) {
      const u = catalogoCache[i].units[ui];
      const pos = u.booked.indexOf(n);
      if (pos === -1) u.booked.push(n); else u.booked.splice(pos, 1);
      renderCatalogo();
    }
    // Escalones de precio de cada unidad: la cuatrimoto se cotiza desde 1
    // persona y los SSV desde 2, igual que en los flyers.
    function nivelesDe(u) {
      const desde = String(u.id).startsWith('cuatrimoto') ? 1 : 2;
      const niveles = [];
      for (let n = desde; n <= u.seats; n++) niveles.push(n);
      return niveles;
    }

    function setTarifa(i, ui, personas, valor) {
      const unidad = catalogoCache[i].units[ui];
      const precio = Number(valor);
      if (!Number.isFinite(precio) || precio < 0) return;
      if (!Array.isArray(unidad.tarifas)) unidad.tarifas = [];
      const t = unidad.tarifas.find(x => x.personas === personas);
      if (t) t.precio = precio;
      else unidad.tarifas.push({ personas, precio });
      unidad.tarifas.sort((a, b) => a.personas - b.personas);
    }

    async function guardarRuta(i) {
      const r = catalogoCache[i];
      const btn = document.getElementById('save-' + i);
      const ok = document.getElementById('ok-' + i);
      btn.disabled = true; btn.textContent = 'Guardando...';

      try {
        const res = await fetch(`${API_URL}/api/catalogo/${r.rid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            activo: r.activo,
            horarios: r.horarios.map(h => ({ hora: h.hora, activo: h.activo })),
            units: r.units.map(u => ({
              id: u.id,
              tarifas: (u.tarifas || []).filter(t => t.precio > 0),
              activo: u.activo,
              booked: u.booked
            }))
          })
        });
        const data = await res.json();
        if (data.ok) {
          ok.textContent = data.rutasSincronizadas > 0
            ? `Guardado (sincronizado en ${data.rutasSincronizadas} ruta${data.rutasSincronizadas === 1 ? '' : 's'} más)`
            : 'Guardado';
          setTimeout(() => { ok.textContent = ''; }, 3000);
          if (data.rutasSincronizadas > 0) await loadCatalogo();
        } else {
          alert('Error: ' + (data.error || 'No se pudo guardar'));
        }
      } catch (err) {
        alert('Error de conexión');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
      }
    }

    async function guardarPrecio(i, ui) {
      const ok = document.getElementById(`ok-precio-${i}-${ui}`);
      ok.textContent = '...';
      await guardarRuta(i);
      ok.textContent = 'Guardado';
      setTimeout(() => { ok.textContent = ''; }, 2000);
    }

    async function subirArchivo(file) {
      if (file.size > 4 * 1024 * 1024) throw new Error('La foto pesa más de 4 MB. Usa una más ligera.');
      const fd = new FormData();
      fd.append('foto', file);
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'No se pudo subir la foto');
      return data.url;
    }

    async function guardarCampoRuta(i, campos) {
      const res = await fetch(`${API_URL}/api/catalogo/${catalogoCache[i].rid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(campos)
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'No se pudo guardar');
      return data;
    }

    async function hacerPortada(i, gi) {
      const url = catalogoCache[i].galeria[gi];
      if (!url || url === catalogoCache[i].img) return;
      catalogoCache[i].img = url;
      renderCatalogo();
      try {
        await guardarCampoRuta(i, { img: url });
      } catch (err) {
        alert('No se pudo guardar la portada: ' + err.message);
      }
    }

    async function subirGaleria(i, input) {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      if (!catalogoCache[i].galeria) catalogoCache[i].galeria = [];

      const espacio = 10 - catalogoCache[i].galeria.length;
      if (espacio <= 0) { alert('Ya tienes 10 fotos, el máximo por ruta'); input.value = ''; return; }
      const aSubir = files.slice(0, espacio);
      if (files.length > espacio) alert(`Solo caben ${espacio} foto(s) más.`);

      const ok = document.getElementById('ok-subida-' + i);
      try {
        for (let n = 0; n < aSubir.length; n++) {
          if (ok) ok.textContent = `Subiendo ${n + 1}/${aSubir.length}...`;
          const url = await subirArchivo(aSubir[n]);
          catalogoCache[i].galeria.push(url);
        }
        const campos = { galeria: catalogoCache[i].galeria };
        if (!catalogoCache[i].img && catalogoCache[i].galeria.length > 0) {
          catalogoCache[i].img = catalogoCache[i].galeria[0];
          campos.img = catalogoCache[i].img;
        }
        await guardarCampoRuta(i, campos);
        if (ok) ok.textContent = 'Guardado';
        renderCatalogo();
      } catch (err) {
        if (ok) ok.textContent = '';
        alert(err.message);
      }
      input.value = '';
    }

    async function quitarFotoGaleria(i, gi) {
      const quitada = catalogoCache[i].galeria.splice(gi, 1)[0];
      const campos = { galeria: catalogoCache[i].galeria };
      if (catalogoCache[i].img === quitada) {
        catalogoCache[i].img = catalogoCache[i].galeria[0] || '';
        campos.img = catalogoCache[i].img;
      }
      renderCatalogo();
      try {
        await guardarCampoRuta(i, campos);
      } catch (err) {
        alert('Se quitó de la vista pero no se pudo guardar: ' + err.message);
      }
    }

    async function guardarGaleria(i) {
      const videoInput = document.getElementById('video-' + i);
      catalogoCache[i].video = videoInput.value.trim();
      const ok = document.getElementById('ok-gal-' + i);
      ok.textContent = '...';
      try {
        await guardarCampoRuta(i, { video: catalogoCache[i].video });
        ok.textContent = 'Guardado';
      } catch (err) {
        ok.textContent = '';
        alert(err.message);
      }
      setTimeout(() => { const el = document.getElementById('ok-gal-' + i); if (el) el.textContent = ''; }, 2500);
    }

    function logout() {
      catalogoCache = [];
      promosCache = [];
      tempToken = null;
      document.getElementById('paso-2fa').style.display = 'none';
      localStorage.removeItem('admin_token');
      token = null;
      userRole = null;
      document.getElementById('login').style.display = 'block';
      document.getElementById('panel').style.display = 'none';
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
    }

    checkSession();
  
// ── DESPACHADOR DE EVENTOS ──
// Mismo principio que en el sitio público: cero onclick/oninput/onchange
// inline para que el CSP pueda poner script-src 'self' sin excepciones.
// data-a="función" (+ data-p="arg1|arg2|...") cubre los clics; los inputs
// de archivo y de tarifa tienen su propio listener porque necesitan el
// elemento o el valor en vivo, no solo argumentos fijos.
const ACTS={switchTab,login,logout,loadReservas,openModalByIdx,closeModal,toggleRuta,toggleHorario,agregarHorario,toggleUnidad,toggleAsiento,guardarPrecio,hacerPortada,quitarFotoGaleria,guardarGaleria,guardarRuta,calNav,calSelectDay,diasCalNav,toggleDia,diasFines,diasTodoMes,diasLimpiarMes,guardarDias,exportarReservasCSV,crearPromo,togglePromo,eliminarPromo,toggleAgente,guardarInstruccionesAgente,renderSeguridad,preparar2FA,activar2FA,desactivar2FA,verificar2FA,copiarCodigos,
 clickFile:id=>document.getElementById(id).click()};

const convArg=s=>{
  if(s==='true')return true;
  if(s==='false')return false;
  return s!==''&&!isNaN(s)?+s:s;
};

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-a],[data-stop]');
  if(!t)return;
  const fn=t.dataset.a&&ACTS[t.dataset.a];
  if(!fn)return;
  const args=t.dataset.p!==undefined?t.dataset.p.split('|').map(convArg):[];
  fn(...args,t,e);
});

// Tarifas: cada tecla manda (i, ui, personas, valorActual).
document.addEventListener('input',e=>{
  const t=e.target.closest('[data-a="setTarifa"]');
  if(!t)return;
  const [i,ui,n]=t.dataset.p.split('|').map(convArg);
  setTarifa(i,ui,n,t.value);
});

// Subir fotos: el <input type=file> manda (i, élMismo) — subirGaleria lee
// input.files, no un valor de texto.
document.addEventListener('change',e=>{
  const t=e.target.closest('[data-a="subirGaleria"]');
  if(!t)return;
  const i=convArg(t.dataset.p);
  subirGaleria(i,t);
});

// Miniaturas rotas: <img> no burbujea 'error', hay que escucharlo en
// fase de captura sobre document.
document.addEventListener('error',e=>{
  const img=e.target;
  if(!img.dataset)return;
  if(img.dataset.onerr==='dim')img.style.opacity='0.25';
  else if(img.dataset.onerr==='hide')img.style.display='none';
},true);
