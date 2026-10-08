// Turns credits into markup. Pure string building: no document, no lights.

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const isBlank = (v) => v && typeof v === "object" && v.kind === "blank";

// A gap only Danny can fill shows as a marked gap, never a guess.
export const text = (v) => (isBlank(v) ? `<span class="blank">${escape(v.hint)}</span>` : escape(v));

export function renderShow(cue, index) {
  const p = cue.production;
  const lead = p.lead ? `<span class="lead">Lead</span>` : "";
  const note = p.note ? `<p class="note">${text(p.note)}</p>` : "";
  return `
  <section class="cue cue--show" data-cue="${index}" style="--gel:${escape(p.gel)}" aria-labelledby="show-${index}">
    <div class="drop">
      <p class="cue-tag">${escape(cue.label.replace("lights", "LX"))}</p>
      <h2 class="show-title" id="show-${index}">${text(p.show)}</h2>
    </div>
    <div class="credit">
      <p class="as">as</p>
      <p class="role">${text(p.role)}${lead}</p>
      <p class="where">${text(p.company)} <span aria-hidden="true">&middot;</span> ${text(p.year)}</p>
      ${note}
    </div>
  </section>`;
}

export function renderCredits(rows) {
  return rows
    .map(
      (p) => `
      <tr>
        <th scope="row">${text(p.show)}</th>
        <td>${text(p.role)}</td>
        <td>${text(p.company)}</td>
        <td>${text(p.year)}</td>
      </tr>`
    )
    .join("");
}

export const renderTraining = (training) =>
  training.map((t) => `<li><strong>${text(t.school)}</strong><span>${text(t.detail)}</span></li>`).join("");
