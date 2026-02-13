import './style.css'
import { initScene } from './scene'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="canvasWrap"><canvas id="c"></canvas></div>

  <header class="header">
    <div class="brand"><span class="brandDot"></span><span>Aurum</span></div>
    <nav class="nav">
      <a href="#s1">Intro</a>
      <a href="#s2">Design</a>
      <a href="#s3">Motion</a>
      <a href="#s4">Finish</a>
    </nav>
  </header>

  <div class="overlay">
    <section id="s1" class="section">
      <div class="sectionInner">
        <div>
          <div class="kicker">Apple-like Scroll / 3D Hero (Original Build)</div>
          <div class="h1">Precision.
          <br/>Depth.
          <br/>Silence.</div>
          <div class="sub">A premium scroll landing inspired by modern product pages — but built from scratch with original visuals and copy. Smooth camera choreography, clean typography, and subtle bloom.</div>
          <span class="pill"><span class="pillDot"></span>three.js • GSAP ScrollTrigger • GitHub Pages</span>
        </div>

        <div class="card">
          <div class="cardTitle">What’s inside</div>
          <ul class="cardList">
            <li><span>•</span><span>Procedural studio environment (no HDR files)</span></li>
            <li><span>•</span><span>3D “phone-like” hero model (procedural geometry)</span></li>
            <li><span>•</span><span>Mist particles + micro depth field illusion</span></li>
          </ul>
          <div class="divider"></div>
          <div class="small">Tip: slow scroll. This is authored like a product ad: controlled beats, not random motion.</div>
        </div>
      </div>
    </section>

    <section id="s2" class="section">
      <div class="sectionInner">
        <div>
          <div class="kicker">Section 02</div>
          <div class="h1">Materials
          <br/>& Light</div>
          <div class="sub">Metal + glass with studio panels. The reflections are procedural to keep loading fast and predictable — even on mobile.</div>
        </div>
        <div class="card">
          <div class="cardTitle">Design notes</div>
          <ul class="cardList">
            <li><span>✦</span><span>Neutral palette + single accent</span></li>
            <li><span>✦</span><span>High contrast typography, minimal UI</span></li>
            <li><span>✦</span><span>Performance clamp for DPR & bloom</span></li>
          </ul>
        </div>
      </div>
    </section>

    <section id="s3" class="section">
      <div class="sectionInner">
        <div>
          <div class="kicker">Section 03</div>
          <div class="h1">Scroll
          <br/>as Timeline</div>
          <div class="sub">The camera moves are bound to scroll progress. Orbit → push-in → mist burst → final lockup. Every beat is intentional.</div>
        </div>
        <div class="card">
          <div class="cardTitle">Motion beats</div>
          <ul class="cardList">
            <li><span>•</span><span>Reveal: wide → hero</span></li>
            <li><span>•</span><span>Orbit: precision rotation</span></li>
            <li><span>•</span><span>Close-up: mist intensity ramps</span></li>
          </ul>
        </div>
      </div>
    </section>

    <section id="s4" class="section">
      <div class="sectionInner">
        <div>
          <div class="kicker">Section 04</div>
          <div class="h1">Deploy
          <br/>free</div>
          <div class="sub">This project is ready to host on GitHub Pages. Replace copy, colors, and the model — keep the choreography.</div>
        </div>
        <div class="card">
          <div class="cardTitle">Run locally</div>
          <div class="small">
            <code>npm install</code><br/>
            <code>npm run dev</code><br/>
            <code>npm run build</code>
          </div>
          <div class="divider"></div>
          <div class="small">Next step if you want: real product CAD/GLB swap + more sections like Apple’s long-scrollytelling.</div>
        </div>
      </div>
    </section>
  </div>

  <div class="scrollHint"><span class="mouse"></span><span>Scroll</span></div>
`

initScene(document.querySelector<HTMLCanvasElement>('#c')!)
