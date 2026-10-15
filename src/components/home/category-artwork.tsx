import type { ProductCategoryVisual } from "@/data/product-categories";

import styles from "./product-categories.module.css";

type CategoryArtworkProps = {
  visual: ProductCategoryVisual;
};

const bearingRollers = Array.from({ length: 10 }, (_, index) => index * 36);
const greaseNodes = Array.from({ length: 8 }, (_, index) => index * 45);

export function CategoryArtwork({ visual }: CategoryArtworkProps) {
  if (visual === "engine") {
    return (
      <svg viewBox="0 0 560 320" role="presentation" focusable="false" data-category-artwork={visual}>
        <g className={styles.blueprint}>
          <path d="M42 56h476M42 264h476M70 34v252M490 34v252" />
          <path d="M42 160h476M280 34v252" strokeDasharray="4 10" />
        </g>
        <g className={styles.engineBlock}>
          <path className={styles.metalFill} d="M168 54h224v92H168z" />
          <path className={styles.surfaceFill} d="M194 74h172v52H194z" />
          <path d="M152 54h256M168 146h224M194 74h172M194 126h172" />
        </g>
        <g className={styles.motionPrimary}>
          <path className={styles.darkFill} d="M232 76h96v54h-96z" />
          <path d="M224 76h112M232 130h96M246 92h68" />
          <path className={styles.connectingRod} d="M280 130v74" />
          <circle className={styles.surfaceFill} cx="280" cy="211" r="23" />
          <circle cx="280" cy="211" r="10" />
        </g>
        <g className={styles.crankAssembly}>
          <circle className={styles.metalFill} cx="280" cy="230" r="50" />
          <circle className={styles.darkFill} cx="280" cy="230" r="24" />
          <path d="M230 230h-52M330 230h52" />
        </g>
        <path className={styles.fluidPath} d="M124 244c38-106 83-112 137-85 44 22 93 13 137-75" />
        <g className={styles.readout}>
          <path d="M86 88h58M416 214h58" />
          <text x="86" y="80">FILM / 01</text>
          <text x="416" y="206">CRANK</text>
        </g>
      </svg>
    );
  }

  if (visual === "gear") {
    return (
      <svg viewBox="0 0 560 320" role="presentation" focusable="false" data-category-artwork={visual}>
        <g className={styles.blueprint}>
          <circle cx="214" cy="166" r="132" />
          <circle cx="386" cy="126" r="90" />
          <path d="M36 166h488M214 28v264M386 34v184" strokeDasharray="4 10" />
        </g>
        <g className={`${styles.gearAssembly} ${styles.motionPrimary}`}>
          <circle className={styles.metalFill} cx="214" cy="166" r="91" />
          <circle className={styles.surfaceFill} cx="214" cy="166" r="54" />
          <circle className={styles.darkFill} cx="214" cy="166" r="21" />
          {bearingRollers.map((rotation) => (
            <path key={rotation} d="M206 54h16v27h-16z" transform={`rotate(${rotation} 214 166)`} />
          ))}
        </g>
        <g className={`${styles.gearAssemblySmall} ${styles.motionSecondary}`}>
          <circle className={styles.metalFill} cx="386" cy="126" r="62" />
          <circle className={styles.surfaceFill} cx="386" cy="126" r="34" />
          <circle className={styles.darkFill} cx="386" cy="126" r="13" />
          {greaseNodes.map((rotation) => (
            <path key={rotation} d="M380 50h12v20h-12z" transform={`rotate(${rotation} 386 126)`} />
          ))}
        </g>
        <path className={styles.fluidPath} d="M94 244c88-38 163-35 226-3 49 25 92 22 145-14" />
        <g className={styles.readout}>
          <text x="66" y="62">MESH / 02</text>
          <path d="M66 70h88M404 260h86" />
          <text x="404" y="279">LOAD PATH</text>
        </g>
      </svg>
    );
  }

  if (visual === "transmission") {
    return (
      <svg viewBox="0 0 560 320" role="presentation" focusable="false" data-category-artwork={visual}>
        <g className={styles.blueprint}>
          <path d="M42 62h476M42 258h476M72 36v248M488 36v248" />
          <circle cx="286" cy="158" r="116" strokeDasharray="3 9" />
        </g>
        <g className={styles.transmissionHousing}>
          <path className={styles.metalFill} d="M116 96h118l48-36 162 58v82l-162 58-48-34H116z" />
          <path d="M116 96h118l48-36 162 58v82l-162 58-48-34H116z" />
        </g>
        <g className={styles.motionPrimary}>
          <circle className={styles.surfaceFill} cx="286" cy="158" r="78" />
          <circle className={styles.darkFill} cx="286" cy="158" r="27" />
          <circle cx="286" cy="92" r="15" />
          <circle cx="344" cy="190" r="15" />
          <circle cx="228" cy="190" r="15" />
          <path d="M286 107v24M330 182l-21-12M242 182l21-12" />
        </g>
        <path className={styles.fluidPath} d="M80 158h120c32 0 40-54 86-54s54 54 86 54h108" />
        <g className={styles.readout}>
          <text x="74" y="82">TRANSFER / 03</text>
          <path d="M74 90h86M402 232h82" />
          <text x="402" y="250">POWER FLOW</text>
        </g>
      </svg>
    );
  }

  if (visual === "hydraulic") {
    return (
      <svg viewBox="0 0 560 320" role="presentation" focusable="false" data-category-artwork={visual}>
        <g className={styles.blueprint}>
          <path d="M44 72h472M44 248h472M72 42v236M488 42v236" />
          <path d="M44 160h472" strokeDasharray="4 10" />
        </g>
        <path className={styles.metalFill} d="M92 104h286v112H92z" />
        <path d="M92 104h286v112H92M112 126h246v68H112" />
        <g className={styles.motionPrimary}>
          <path className={styles.darkFill} d="M238 114h42v92h-42z" />
          <path d="M238 114h42v92h-42M280 144h188v32H280" />
          <path className={styles.surfaceFill} d="M468 134h28v52h-28z" />
        </g>
        <path className={styles.fluidPath} d="M58 160h178M282 160h184" />
        <path className={styles.pressurePath} d="M120 194v48h342v-48" />
        <g className={styles.readout}>
          <text x="58" y="88">PRESSURE / 04</text>
          <path d="M58 96h108M402 230h82" />
          <text x="402" y="250">ACTUATOR</text>
        </g>
      </svg>
    );
  }

  if (visual === "industrial") {
    return (
      <svg viewBox="0 0 560 320" role="presentation" focusable="false" data-category-artwork={visual}>
        <g className={styles.blueprint}>
          <path d="M44 52h472M44 268h472M70 32v256M490 32v256" />
          <path d="M44 160h472M280 32v256" strokeDasharray="4 10" />
        </g>
        <path className={styles.metalFill} d="M74 114h152v92H74zM334 114h152v92H334z" />
        <path d="M74 114h152v92H74M334 114h152v92H334" />
        <g className={styles.motionPrimary}>
          <circle className={styles.surfaceFill} cx="280" cy="160" r="95" />
          <circle className={styles.darkFill} cx="280" cy="160" r="59" />
          <circle cx="280" cy="160" r="24" />
          {bearingRollers.map((rotation) => (
            <rect key={rotation} x="272" y="76" width="16" height="29" rx="7" transform={`rotate(${rotation} 280 160)`} />
          ))}
        </g>
        <path className={styles.shaft} d="M46 148h142v24H46M372 148h142v24H372" />
        <path className={styles.fluidPath} d="M154 88c70-49 176-49 252 5" />
        <g className={styles.readout}>
          <text x="58" y="76">SPINDLE / 05</text>
          <path d="M58 84h94M398 236h88" />
          <text x="398" y="254">DUTY CYCLE</text>
        </g>
      </svg>
    );
  }

  if (visual === "grease") {
    return (
      <svg viewBox="0 0 560 320" role="presentation" focusable="false" data-category-artwork={visual}>
        <g className={styles.blueprint}>
          <circle cx="280" cy="160" r="132" />
          <path d="M44 160h472M280 28v264" strokeDasharray="4 10" />
        </g>
        <g className={styles.motionPrimary}>
          <circle className={styles.metalFill} cx="280" cy="160" r="104" />
          <circle className={styles.surfaceFill} cx="280" cy="160" r="70" />
          <circle className={styles.darkFill} cx="280" cy="160" r="35" />
          {greaseNodes.map((rotation) => (
            <circle key={rotation} className={styles.rollerFill} cx="280" cy="77" r="16" transform={`rotate(${rotation} 280 160)`} />
          ))}
        </g>
        <path className={styles.fluidPath} d="M190 107c25-39 67-59 111-54 53 6 83 42 106 82" />
        <path className={styles.greasePath} d="M192 209c27 34 62 51 105 50 47-1 78-21 105-55" />
        <g className={styles.readout}>
          <text x="60" y="72">DISTRIBUTE / 06</text>
          <path d="M60 80h110M402 236h82" />
          <text x="402" y="254">BEARING RACE</text>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 560 320" role="presentation" focusable="false" data-category-artwork={visual}>
      <g className={styles.blueprint}>
        <path d="M44 58h472M44 262h472M68 34v252M492 34v252" />
        <path d="M44 160h472" strokeDasharray="4 10" />
      </g>
      <g className={styles.manifold}>
        <path className={styles.metalFill} d="M104 104h352v112H104z" />
        <path d="M104 104h352v112H104M138 132h284M138 188h284" />
        <circle className={styles.surfaceFill} cx="176" cy="160" r="36" />
        <circle className={styles.surfaceFill} cx="280" cy="160" r="36" />
        <circle className={styles.surfaceFill} cx="384" cy="160" r="36" />
        <path className={styles.motionPrimary} d="M176 138v44M154 160h44M280 138v44M258 160h44M384 138v44M362 160h44" />
      </g>
      <path className={styles.fluidPath} d="M54 160h86m72 0h32m72 0h32m72 0h86" />
      <path className={styles.pressurePath} d="M176 104V70h208v34M280 216v38" />
      <g className={styles.readout}>
        <text x="58" y="82">CONTROL / 07</text>
        <path d="M58 90h96M400 238h86" />
        <text x="400" y="256">SPECIAL DUTY</text>
      </g>
    </svg>
  );
}
