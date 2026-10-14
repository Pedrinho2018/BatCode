/*!
 * Batu — o morceguinho do BatCode
 * Web component sem dependências: <batu-morcego energia="100"></batu-morcego>
 *
 * Estados automáticos pela energia (0–100):
 *   energia > 30   → normal   (voa, pisca)
 *   1 a 30         → cansado  (olho caído, suando, asa mole)
 *   0              → dormindo (pendurado de cabeça pra baixo)
 *
 * Reações rápidas (voltam sozinhas pro estado da energia):
 *   batu.dano()        → leva um susto
 *   batu.dano(40)      → leva o susto E perde 40 de energia
 *   batu.comemorar()   → festa (acertou o desafio)
 *
 * Travar num estado fixo: <batu-morcego estado="feliz"></batu-morcego>
 * Tamanho: width no CSS ou --batu-tamanho (padrão 160px)
 * Sem sombra no chão (ex.: ícone pequeno): <batu-morcego sem-sombra></batu-morcego>
 * Evento: "batu-estado" dispara quando o estado muda (event.detail.estado)
 */
(function () {
  if (customElements.get('batu-morcego')) return;

  var ESTADOS = ['normal', 'cansado', 'dormindo', 'dano', 'feliz'];
  var ROTULOS = {
    normal: 'voando de boa',
    cansado: 'cansado, com pouca energia',
    dormindo: 'dormindo de cabeça pra baixo',
    dano: 'levou dano',
    feliz: 'comemorando'
  };

  var CSS = [
    ':host{display:inline-block;width:var(--batu-tamanho,160px);aspect-ratio:1/1;line-height:0}',
    'svg{width:100%;height:100%;display:block;overflow:visible}',
    'svg{--tinta:#140B26;--pele:#7B3FE4;--pele2:#A06BFF;--membrana:#5B21B6;--osso:#C4A0FF;--mascara:#2A1650;--rosa:#FF6B9D;--boca:#3D0A28;--lingua:#FF5C8A;--sangue:#FF2D55;--brilho:#FFD60A;--ciano:#22D3EE;--suor:#22D3EE;--galho:#6B4F3A;--folha:#4ADE80}',
    '.pele{fill:url(#gradPele)}.membrana{fill:var(--membrana)}.mascara{fill:var(--mascara)}',
    '.sobrancelha{fill:var(--tinta)}',
    '.so{display:none}',
    '.normal .so-normal,.cansado .so-cansado,.dormindo .so-dormindo,.dano .so-dano,.feliz .so-feliz{display:inline}',

    /* corpo flutuando */
    '.flutua{animation:flutua 2.2s ease-in-out infinite}',
    '@keyframes flutua{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '.sombra{transform-origin:100px 184px;animation:sombra 2.2s ease-in-out infinite}',
    ':host([sem-sombra]) .sombra{display:none}',
    '@keyframes sombra{0%,100%{transform:scaleX(1);opacity:.16}50%{transform:scaleX(.82);opacity:.1}}',

    /* asas (pivô no ombro) */
    '.asa{transform-origin:62px 98px;animation:bate .45s ease-in-out infinite alternate}',
    '@keyframes bate{from{transform:rotate(-10deg)}to{transform:rotate(12deg)}}',

    /* piscar */
    '.olhos-abertos{transform-origin:100px 98px;animation:pisca 4.2s infinite}',
    '@keyframes pisca{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}',

    /* virar de cabeça pra baixo */
    '.virar{transform-origin:100px 104px;transition:transform .5s cubic-bezier(.5,1.6,.5,1)}',
    '.balanco{transform-origin:100px 56px}',

    /* ---- cansado ---- */
    '.cansado .flutua{animation-duration:3.6s}',
    '.cansado .sombra{animation-duration:3.6s}',
    '.cansado .asa{transform:rotate(-24deg);animation:bate-mole 1.6s ease-in-out infinite alternate}',
    '@keyframes bate-mole{from{transform:rotate(-30deg)}to{transform:rotate(-20deg)}}',
    '.gota{animation:pinga 1.8s ease-in infinite}',
    '@keyframes pinga{0%{transform:translateY(-4px);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateY(8px);opacity:0}}',

    /* ---- dormindo ---- */
    '.dormindo .virar{transform:rotate(180deg)}',
    '.dormindo .balanco{animation:balanca 3.2s ease-in-out infinite}',
    '@keyframes balanca{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}',
    '.dormindo .flutua,.dormindo .sombra{animation:none}',
    '.dormindo .sombra{opacity:0}',
    '.dormindo .asa{animation:none;transform:rotate(-58deg) scale(.62)}',
    '.zz{animation:zz 2.4s ease-out infinite;opacity:0}',
    '.zz.z2{animation-delay:.8s}.zz.z3{animation-delay:1.6s}',
    '@keyframes zz{0%{transform:translate(0,6px);opacity:0}25%{opacity:1}100%{transform:translate(8px,-14px);opacity:0}}',

    /* ---- dano ---- */
    '.dano .treme{animation:treme 1.4s linear}',
    '@keyframes treme{0%{transform:translateX(0)}4%{transform:translateX(-7px)}8%{transform:translateX(7px)}12%{transform:translateX(-5px)}16%{transform:translateX(5px)}20%{transform:translateX(-2px)}24%,100%{transform:translateX(0)}}',
    '.dano .pele{animation:vermelho 1.4s ease-out}',
    '@keyframes vermelho{0%,12%{fill:var(--sangue)}18%{fill:url(#gradPele)}24%{fill:var(--sangue)}40%,100%{fill:url(#gradPele)}}',
    '.dano .membrana{animation:vermelho-membrana 1.4s ease-out}',
    '@keyframes vermelho-membrana{0%,12%{fill:var(--sangue)}18%{fill:var(--membrana)}24%{fill:var(--sangue)}40%,100%{fill:var(--membrana)}}',
    '.dano .asa{animation:none;transform:rotate(26deg)}',
    '.dano .flutua{animation:none}',
    '.impacto{animation:impacto 1.4s ease-out}',
    '@keyframes impacto{0%{opacity:0}6%{opacity:1}40%{opacity:1}60%,100%{opacity:0}}',
    '.fixo.dano .treme,.fixo.dano .pele,.fixo.dano .membrana,.fixo.dano .impacto{animation-iteration-count:infinite}',

    /* ---- feliz ---- */
    '.feliz .flutua{animation:pula .55s ease-in-out infinite}',
    '@keyframes pula{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}',
    '.feliz .sombra{animation-duration:.55s}',
    '.feliz .asa{transform:rotate(28deg);animation:bate-festa .14s ease-in-out infinite alternate}',
    '@keyframes bate-festa{from{transform:rotate(18deg)}to{transform:rotate(40deg)}}',
    '.feliz .bochecha{opacity:.9}',
    '.estrela{animation:brilha 1s ease-in-out infinite}',
    '.estrela.e2{animation-delay:.25s}.estrela.e3{animation-delay:.5s}.estrela.e4{animation-delay:.75s}',
    '@keyframes brilha{0%,100%{transform:scale(.4) rotate(0);opacity:.3}50%{transform:scale(1.1) rotate(20deg);opacity:1}}',

    '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.zz{opacity:1}}'
  ].join('\n');

  /* ---------- partes do desenho (coordenadas do lado esquerdo; o direito é espelhado) ---------- */
  var ASA =
    '<path class="membrana" d="M64 92 C50 70 28 60 6 62 C12 74 14 86 10 100 Q22 94 28 110 Q38 102 46 120 Q54 110 66 118 Z"' +
    ' stroke="var(--tinta)" stroke-width="4.5" stroke-linejoin="round"/>' +
    '<path d="M38 68 L13 97 M38 68 L29 106 M38 68 L46 116" stroke="var(--osso)" stroke-width="2.6" stroke-linecap="round" fill="none"/>';

  var ORELHA =
    '<path class="pele" d="M64 82 C56 58 50 34 54 14 C72 24 90 44 100 64 Z" stroke="var(--tinta)" stroke-width="4.5" stroke-linejoin="round"/>' +
    '<path d="M66 70 C61 54 57 38 59 26 C70 35 80 47 88 60 Z" fill="var(--rosa)" opacity=".75"/>';

  var PE = '<ellipse class="pele" cx="88" cy="148" rx="7" ry="6" stroke="var(--tinta)" stroke-width="4"/>';

  var ESPELHO = 'matrix(-1 0 0 1 200 0)';

  function estrela(x, y, s, n) {
    return '<g transform="translate(' + x + ' ' + y + ')"><path class="estrela e' + n + '" d="M0 ' + (-s) +
      ' Q0 0 ' + s + ' 0 Q0 0 0 ' + s + ' Q0 0 ' + (-s) + ' 0 Q0 0 0 ' + (-s) + ' Z" fill="var(--brilho)" stroke="var(--tinta)" stroke-width="2" stroke-linejoin="round"/></g>';
  }

  var OLHO_ESQ_ABERTO =
    '<ellipse cx="82" cy="99" rx="15" ry="16.5" fill="#fff" stroke="var(--tinta)" stroke-width="4"/>' +
    '<ellipse cx="84" cy="101" rx="10" ry="11.5" fill="var(--ciano)"/>' +
    '<ellipse cx="84" cy="102" rx="6" ry="7.5" fill="var(--tinta)"/>' +
    '<circle cx="80" cy="96" r="3.6" fill="#fff"/><circle cx="88" cy="106" r="1.8" fill="#fff" opacity=".8"/>';
  var OLHO_DIR_ABERTO =
    '<ellipse cx="118" cy="99" rx="15" ry="16.5" fill="#fff" stroke="var(--tinta)" stroke-width="4"/>' +
    '<ellipse cx="120" cy="101" rx="10" ry="11.5" fill="var(--ciano)"/>' +
    '<ellipse cx="120" cy="102" rx="6" ry="7.5" fill="var(--tinta)"/>' +
    '<circle cx="116" cy="96" r="3.6" fill="#fff"/><circle cx="124" cy="106" r="1.8" fill="#fff" opacity=".8"/>';

  /* sobrancelhas angulares — o que dá atitude */
  var CENHO_SERIO =
    '<path class="sobrancelha" d="M64 79 L95 88 L93 95 L63 86 Z"/>' +
    '<path class="sobrancelha" d="M136 79 L105 88 L107 95 L137 86 Z"/>';
  var CENHO_BRAVO =
    '<path class="sobrancelha" d="M62 76 L97 92 L94 99 L60 84 Z"/>' +
    '<path class="sobrancelha" d="M138 76 L103 92 L106 99 L140 84 Z"/>';
  var CENHO_ALEGRE =
    '<path class="sobrancelha" d="M66 78 Q81 68 95 76 L94 82 Q81 75 67 84 Z"/>' +
    '<path class="sobrancelha" d="M134 78 Q119 68 105 76 L106 82 Q119 75 133 84 Z"/>';
  var CENHO_CAIDO =
    '<path class="sobrancelha" d="M64 86 L95 78 L96 85 L65 93 Z" opacity=".85"/>' +
    '<path class="sobrancelha" d="M136 86 L105 78 L104 85 L135 93 Z" opacity=".85"/>';

  var SVG =
    '<svg class="batu normal" viewBox="0 0 200 200" role="img" aria-label="Batu" xmlns="http://www.w3.org/2000/svg">' +

    '<defs>' +
      '<linearGradient id="gradPele" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="var(--pele2)"/><stop offset="100%" stop-color="var(--pele)"/>' +
      '</linearGradient>' +
    '</defs>' +

    /* galho (só dormindo) */
    '<g class="so so-dormindo">' +
      '<path d="M30 55 L170 55" stroke="var(--galho)" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M140 55 Q150 44 162 42" stroke="var(--galho)" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '<path d="M162 42 Q172 32 182 38 Q174 48 162 42 Z" fill="var(--folha)" stroke="var(--tinta)" stroke-width="2" stroke-linejoin="round"/>' +
    '</g>' +

    '<ellipse class="sombra" cx="100" cy="184" rx="30" ry="5" fill="#000" opacity=".16"/>' +

    '<g class="balanco"><g class="virar"><g class="flutua"><g class="treme">' +

      /* asas atrás do corpo */
      '<g class="asa">' + ASA + '</g>' +
      '<g transform="' + ESPELHO + '"><g class="asa">' + ASA + '</g></g>' +

      /* pés, orelhas, topete */
      PE + '<g transform="' + ESPELHO + '">' + PE + '</g>' +
      ORELHA + '<g transform="' + ESPELHO + '">' + ORELHA + '</g>' +
      '<path class="pele" d="M92 68 C88 58 94 50 100 55 C102 48 112 49 109 60 Z" stroke="var(--tinta)" stroke-width="4" stroke-linejoin="round"/>' +

      /* corpo-bolinha */
      '<ellipse class="pele" cx="100" cy="104" rx="44" ry="42" stroke="var(--tinta)" stroke-width="4.5"/>' +
      '<path class="mascara" d="M100 80 C90 68 60 72 60 100 C60 120 82 132 100 132 C118 132 140 120 140 100 C140 72 110 68 100 80 Z"/>' +
      '<path d="M88 136 Q100 141 112 136" stroke="var(--tinta)" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".35"/>' +

      /* bochechas */
      '<ellipse class="bochecha" cx="66" cy="120" rx="9" ry="5.5" fill="var(--rosa)" opacity=".65"/>' +
      '<ellipse class="bochecha" cx="134" cy="120" rx="9" ry="5.5" fill="var(--rosa)" opacity=".65"/>' +

      /* ===== olhos ===== */
      '<g class="so so-normal"><g class="olhos-abertos">' + OLHO_ESQ_ABERTO + OLHO_DIR_ABERTO + '</g>' + CENHO_SERIO + '</g>' +

      '<g class="so so-cansado">' +
        '<ellipse cx="82" cy="99" rx="15" ry="16.5" fill="#fff" stroke="var(--tinta)" stroke-width="4"/>' +
        '<ellipse cx="83" cy="106" rx="9" ry="8" fill="var(--ciano)"/>' +
        '<ellipse cx="83" cy="107" rx="5.5" ry="5" fill="var(--tinta)"/><circle cx="80" cy="105" r="2.4" fill="#fff"/>' +
        '<path class="mascara" d="M66 103 L98 97 C98 76 66 78 66 103 Z"/>' +
        '<path d="M66.5 103 L97.5 97" stroke="var(--tinta)" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="118" cy="99" rx="15" ry="16.5" fill="#fff" stroke="var(--tinta)" stroke-width="4"/>' +
        '<ellipse cx="117" cy="106" rx="9" ry="8" fill="var(--ciano)"/>' +
        '<ellipse cx="117" cy="107" rx="5.5" ry="5" fill="var(--tinta)"/><circle cx="114" cy="105" r="2.4" fill="#fff"/>' +
        '<path class="mascara" d="M134 103 L102 97 C102 76 134 78 134 103 Z"/>' +
        '<path d="M133.5 103 L102.5 97" stroke="var(--tinta)" stroke-width="4" stroke-linecap="round"/>' +
        CENHO_CAIDO +
      '</g>' +

      '<g class="so so-dano">' +
        '<g fill="none" stroke="var(--tinta)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M72 88 L93 99 L72 110"/><path d="M128 88 L107 99 L128 110"/>' +
        '</g>' + CENHO_BRAVO +
      '</g>' +

      '<g class="so so-feliz">' +
        '<g fill="none" stroke="var(--tinta)" stroke-width="5" stroke-linecap="round">' +
          '<path d="M69 105 Q82 83 95 105"/><path d="M105 105 Q118 83 131 105"/>' +
        '</g>' + CENHO_ALEGRE +
      '</g>' +

      '<g class="so so-dormindo" fill="none" stroke="var(--tinta)" stroke-width="4.5" stroke-linecap="round">' +
        '<path d="M70 97 Q82 108 94 97"/><path d="M106 97 Q118 108 130 97"/>' +
      '</g>' +

      /* ===== bocas ===== */
      '<g class="so so-normal">' +
        '<path d="M90 122 Q100 130 110 122" fill="none" stroke="var(--tinta)" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M103 124 L105.5 133 L108.5 123 Z" fill="#fff" stroke="var(--tinta)" stroke-width="2.4" stroke-linejoin="round"/>' +
      '</g>' +
      '<g class="so so-cansado">' +
        '<path d="M90 126 Q95 122 100 126 Q105 130 110 126" fill="none" stroke="var(--tinta)" stroke-width="4" stroke-linecap="round"/>' +
      '</g>' +
      '<g class="so so-dano">' +
        '<ellipse cx="100" cy="125" rx="7.5" ry="9.5" fill="var(--boca)" stroke="var(--tinta)" stroke-width="3.5"/>' +
        '<ellipse cx="100" cy="129" rx="4" ry="3.5" fill="var(--lingua)"/>' +
      '</g>' +
      '<g class="so so-feliz">' +
        '<path d="M84 117 Q100 142 116 117 Z" fill="var(--boca)" stroke="var(--tinta)" stroke-width="3.8" stroke-linejoin="round"/>' +
        '<path d="M94 130 Q100 125 106 130 Q100 136 94 130 Z" fill="var(--lingua)"/>' +
        '<path d="M88 117 L90.5 124 L94 117 Z M106 117 L109.5 124 L112 117 Z" fill="#fff" stroke="var(--tinta)" stroke-width="2.2" stroke-linejoin="round"/>' +
      '</g>' +
      '<g class="so so-dormindo">' +
        '<ellipse cx="100" cy="122" rx="4.5" ry="5.5" fill="var(--boca)" stroke="var(--tinta)" stroke-width="2.5"/>' +
      '</g>' +

      /* gota de suor (cansado) */
      '<g class="so so-cansado"><path class="gota" d="M139 72 C135 80 133 85 136 88 C139 91 145 89 145 85 C145 82 142 78 139 72 Z" fill="var(--suor)" stroke="var(--tinta)" stroke-width="2.5" stroke-linejoin="round"/></g>' +

    '</g></g></g></g>' +

    /* efeitos fora do corpo */
    '<g class="so so-dano impacto" stroke="var(--sangue)" stroke-width="4.5" stroke-linecap="round">' +
      '<path d="M48 58 L38 48 M58 50 L55 37 M40 72 L27 70"/>' +
      '<path d="M152 58 L162 48 M142 50 L145 37 M160 72 L173 70"/>' +
    '</g>' +
    '<g class="so so-feliz">' + estrela(20, 38, 9, 1) + estrela(178, 32, 11, 2) + estrela(184, 122, 7, 3) + estrela(16, 128, 8, 4) + '</g>' +
    '<g class="so so-dormindo" fill="var(--tinta)" font-family="Georgia, \'Times New Roman\', serif" font-weight="700">' +
      '<text class="zz z1" x="160" y="132" font-size="14">z</text>' +
      '<text class="zz z2" x="170" y="114" font-size="18">z</text>' +
      '<text class="zz z3" x="180" y="92" font-size="22">Z</text>' +
    '</g>' +
    '</svg>';

  class Batu extends HTMLElement {
    static get observedAttributes() { return ['energia', 'estado']; }

    constructor() {
      super();
      var raiz = this.attachShadow({ mode: 'open' });
      raiz.innerHTML = '<style>' + CSS + '</style>' + SVG;
      this._svg = raiz.querySelector('svg');
      this._reacao = null;
      this._timer = 0;
      this._atual = null;
    }

    connectedCallback() { this._render(); }
    disconnectedCallback() { clearTimeout(this._timer); }
    attributeChangedCallback() { this._render(); }

    get energia() {
      var v = parseInt(this.getAttribute('energia'), 10);
      if (isNaN(v)) return 100;
      return Math.max(0, Math.min(100, v));
    }
    set energia(v) {
      var n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
      this.setAttribute('energia', String(n));
    }

    get estado() { return this._atual; }

    dano(quantidade) {
      if (typeof quantidade === 'number') this.energia = this.energia - quantidade;
      this._reagir('dano', 900);
    }

    comemorar() { this._reagir('feliz', 1600); }

    _reagir(nome, ms) {
      var self = this;
      clearTimeout(this._timer);
      this._reacao = nome;
      // força a animação a reiniciar mesmo se já estava nesse estado
      this._svg.classList.remove(nome);
      void this._svg.getBoundingClientRect();
      this._render();
      this._timer = setTimeout(function () { self._reacao = null; self._render(); }, ms);
    }

    _render() {
      var fixo = this.getAttribute('estado');
      var e;
      if (fixo && ESTADOS.indexOf(fixo) !== -1) e = fixo;
      else if (this._reacao) e = this._reacao;
      else {
        var n = this.energia;
        e = n <= 0 ? 'dormindo' : n <= 30 ? 'cansado' : 'normal';
      }
      var svg = this._svg;
      ESTADOS.forEach(function (s) { svg.classList.toggle(s, s === e); });
      svg.classList.toggle('fixo', !!(fixo && ESTADOS.indexOf(fixo) !== -1));
      svg.setAttribute('aria-label', 'Batu ' + ROTULOS[e]);
      if (e !== this._atual) {
        this._atual = e;
        this.dispatchEvent(new CustomEvent('batu-estado', { detail: { estado: e }, bubbles: true }));
      }
    }
  }

  customElements.define('batu-morcego', Batu);
})();
