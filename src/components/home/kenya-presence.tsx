import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { siteConfig } from "@/config/site";
import { kenyaLocationReferences, kenyaMapData } from "@/data/kenya-map";

import styles from "./kenya-presence.module.css";

type GeographicPoint = { latitude: number; longitude: number };

function projectToKenya({ latitude, longitude }: GeographicPoint) {
  const { bounds, viewBox } = kenyaMapData;
  return {
    x: viewBox.inset + ((longitude - bounds.west) / (bounds.east - bounds.west)) * (viewBox.width - viewBox.inset * 2),
    y: viewBox.inset + ((bounds.north - latitude) / (bounds.north - bounds.south)) * (viewBox.height - viewBox.inset * 2),
  };
}

const localBounds = { west: 36.78, east: 37, south: -1.44, north: -1.22 } as const;

function projectToLocalPlot({ latitude, longitude }: GeographicPoint) {
  return {
    x: 26 + ((longitude - localBounds.west) / (localBounds.east - localBounds.west)) * 268,
    y: 24 + ((localBounds.north - latitude) / (localBounds.north - localBounds.south)) * 142,
  };
}

function KenyaMapVisual() {
  const nairobi = projectToKenya(kenyaLocationReferences.nairobi);
  const mlolongo = projectToKenya(kenyaLocationReferences.mlolongo);
  const localNairobi = projectToLocalPlot(kenyaLocationReferences.nairobi);
  const localMlolongo = projectToLocalPlot(kenyaLocationReferences.mlolongo);

  return (
    <figure className={styles.visualField} data-kenya-map data-visual-slot="kenya">
      <div className={styles.visualMeta} aria-hidden="true">
        <span>Geographic context / KE</span>
        <span>Natural Earth boundary</span>
      </div>

      <div className={styles.mapComposition}>
        <svg
          aria-hidden="true"
          className={styles.countryMap}
          focusable="false"
          viewBox={`0 0 ${kenyaMapData.viewBox.width} ${kenyaMapData.viewBox.height}`}
        >
          <defs>
            <linearGradient id="kenya-map-surface" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.13" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.025" />
            </linearGradient>
            <filter id="kenya-map-shadow" x="-20%" width="140%" y="-20%" height="140%">
              <feDropShadow dx="0" dy="14" floodColor="currentColor" floodOpacity="0.12" stdDeviation="13" />
            </filter>
          </defs>
          <g className={styles.plotGrid}>
            <path d="M50 180H550M50 360H550M50 540H550" />
            <path d="M175 50V670M300 50V670M425 50V670" />
          </g>
          <path className={styles.countryShadow} d={kenyaMapData.path} filter="url(#kenya-map-shadow)" />
          <path className={styles.countryShape} d={kenyaMapData.path} />
          <path className={styles.countryContour} d={kenyaMapData.path} />

          <g className={styles.locationPlot}>
            <path className={styles.relationshipLine} d={`M${nairobi.x} ${nairobi.y} L${mlolongo.x} ${mlolongo.y}`} />
            <circle className={styles.nairobiPoint} cx={nairobi.x} cy={nairobi.y} r="5" />
            <path className={styles.nairobiLeader} d={`M${nairobi.x} ${nairobi.y} L${nairobi.x - 92} ${nairobi.y - 64} H${nairobi.x - 152}`} />
            <text className={styles.nairobiLabel} x={nairobi.x - 154} y={nairobi.y - 73}>NAIROBI</text>
            <text className={styles.referenceLabel} x={nairobi.x - 154} y={nairobi.y - 55}>REFERENCE CITY</text>

            <circle className={styles.mlolongoSignal} cx={mlolongo.x} cy={mlolongo.y} r="28" />
            <circle className={styles.mlolongoSignalSecondary} cx={mlolongo.x} cy={mlolongo.y} r="16" />
            <circle className={styles.mlolongoPoint} cx={mlolongo.x} cy={mlolongo.y} r="7" />
            <path className={styles.mlolongoLeader} d={`M${mlolongo.x} ${mlolongo.y} L${mlolongo.x + 100} ${mlolongo.y + 72} H${mlolongo.x + 164}`} />
            <text className={styles.mlolongoLabel} x={mlolongo.x + 166} y={mlolongo.y + 66}>MLOLONGO</text>
            <text className={styles.baseLabel} x={mlolongo.x + 166} y={mlolongo.y + 84}>OPERATING BASE</text>
          </g>
        </svg>

        <div className={styles.localPlot} data-location-detail>
          <div className={styles.localPlotHeader}><span>Local relationship</span><span>NBO → MLO</span></div>
          <svg aria-hidden="true" focusable="false" viewBox="0 0 320 190">
            <g className={styles.localGrid}>
              <path d="M26 71H294M26 118H294" />
              <path d="M93 24V166M160 24V166M227 24V166" />
            </g>
            <path className={styles.localRelationshipLine} d={`M${localNairobi.x} ${localNairobi.y} L${localMlolongo.x} ${localMlolongo.y}`} />
            <circle className={styles.localNairobiPoint} cx={localNairobi.x} cy={localNairobi.y} r="4" />
            <text className={styles.localNairobiLabel} x={localNairobi.x + 9} y={localNairobi.y - 8}>NAIROBI</text>
            <text className={styles.localReferenceLabel} x={localNairobi.x + 9} y={localNairobi.y + 7}>REFERENCE</text>
            <circle className={styles.localMlolongoSignal} cx={localMlolongo.x} cy={localMlolongo.y} r="12" />
            <circle className={styles.localMlolongoPoint} cx={localMlolongo.x} cy={localMlolongo.y} r="5" />
            <text className={styles.localMlolongoLabel} x={localMlolongo.x - 9} y={localMlolongo.y - 18}>MLOLONGO</text>
            <text className={styles.localBaseLabel} x={localMlolongo.x - 9} y={localMlolongo.y - 4}>OPERATING BASE</text>
          </svg>
        </div>
      </div>

      <figcaption className={styles.locationLegend}>
        <span><i className={styles.primaryKey} />Mlolongo · operating base</span>
        <span><i className={styles.referenceKey} />Nairobi · nearby reference city</span>
      </figcaption>
    </figure>
  );
}

export function KenyaPresence() {
  return (
    <section className={styles.section} aria-labelledby="kenya-presence-title" data-kenya-location-section>
      <PageContainer className={styles.container} size="wide">
        <header className={styles.heading}>
          <p className={styles.eyebrow}><span>07</span>Kenya presence</p>
          <div className={styles.headingGrid}>
            <h2 id="kenya-presence-title">Based in Kenya. <span>Built for industry.</span></h2>
            <p>Haribol Lubes operates from Mlolongo for automotive, commercial and industrial lubricant enquiries in Kenya.</p>
          </div>
        </header>

        <div className={styles.locationComposition}>
          <KenyaMapVisual />
          <aside className={styles.addressPanel} aria-labelledby="home-location-title">
            <div className={styles.addressHeader}><span>Verified business address</span><span>MLO / KE</span></div>
            <div className={styles.locationCode} aria-hidden="true">MLO</div>
            <div className={styles.addressContent}>
              <p id="home-location-title">Operating base</p>
              <address>
                <strong>{siteConfig.businessAddress.venue}</strong>
                <span>{siteConfig.businessAddress.street}</span>
                <span>{siteConfig.businessAddress.locality}</span>
                <span>{siteConfig.businessAddress.country}</span>
              </address>
              <dl className={styles.locationRoles}>
                <div><dt>Primary location</dt><dd>Mlolongo, Kenya</dd></div>
                <div><dt>Nearby reference</dt><dd>Nairobi</dd></div>
              </dl>
            </div>
            <a href={siteConfig.businessAddress.mapsUrl} rel="noopener noreferrer" target="_blank">
              Open in Maps
              <ArrowRightIcon />
            </a>
          </aside>
        </div>
        <p className={styles.mapAttribution}>Country boundary: Natural Earth · Location references: © OpenStreetMap contributors</p>
      </PageContainer>
    </section>
  );
}
