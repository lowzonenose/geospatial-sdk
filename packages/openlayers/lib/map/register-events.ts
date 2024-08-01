import Map, { MapObjectEventTypes } from "ol/Map";
import {
  FeaturesClickEventType,
  FeaturesHoverEventType,
  MapClickEventType,
  MapEvent,
  MapEventType,
} from "@geospatial-sdk/core";
import { toLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import OlFeature from "ol/Feature";
import BaseEvent from "ol/events/Event";
import { MapBrowserEvent } from "ol";
import { Coordinate } from "ol/coordinate";
import TileWMS from "ol/source/TileWMS";
import ImageWMS from "ol/source/ImageWMS";
import Layer from "ol/layer/Layer";
import { Pixel } from "ol/pixel";
import type { Feature, FeatureCollection } from "geojson";

const GEOJSON = new GeoJSON();

export function getFeaturesFromVectorSources(
  olMap: Map,
  pixel: Pixel,
): Feature[] {
  const olFeatures = olMap.getFeaturesAtPixel(pixel);
  const { features } = GEOJSON.writeFeaturesObject(olFeatures as OlFeature[]);
  if (!features) {
    return [];
  }
  return features;
}

export function getGFIUrl(
  source: TileWMS | ImageWMS,
  map: Map,
  coordinate: Coordinate,
): string | null {
  const view = map.getView();
  const projection = view.getProjection();
  const resolution = view.getResolution() as number;
  const params = {
    ...source.getParams(),
    INFO_FORMAT: "application/json",
  };
  return (
    source.getFeatureInfoUrl(coordinate, resolution, projection, params) ?? null
  );
}

export function getFeaturesFromWmsSources(
  olMap: Map,
  coordinate: Coordinate,
): Promise<Feature[]> {
  const wmsSources: (ImageWMS | TileWMS)[] = olMap
    .getLayers()
    .getArray()
    .filter(
      (layer): layer is Layer<ImageWMS | TileWMS> =>
        layer instanceof Layer &&
        (layer.getSource() instanceof TileWMS ||
          layer.getSource() instanceof ImageWMS),
    )
    .map((layer) => layer.getSource()!);

  if (!wmsSources.length) {
    return Promise.resolve([]);
  }

  const gfiUrls = wmsSources.reduce((urls, source) => {
    const gfiUrl = getGFIUrl(source, olMap, coordinate);
    return gfiUrl ? [...urls, gfiUrl] : urls;
  }, [] as string[]);
  return Promise.all(
    gfiUrls.map((url) =>
      fetch(url)
        .then((response) => response.json())
        .then((collection: FeatureCollection) => collection.features),
    ),
  ).then((features) => features.flat());
}

async function readFeaturesAtPixel(
  map: Map,
  event: MapBrowserEvent<PointerEvent>,
) {
  return [
    ...getFeaturesFromVectorSources(map, event.pixel),
    ...(await getFeaturesFromWmsSources(map, event.coordinate)),
  ];
}

function registerFeatureClickEvent(map: Map) {
  if (map.get(FeaturesClickEventType)) return;
  map.on("click", async (event) => {
    const features = await readFeaturesAtPixel(map, event);
    map.dispatchEvent({
      type: FeaturesClickEventType,
      features,
    } as unknown as BaseEvent);
  });
  map.set(FeaturesClickEventType, true);
}

function registerFeatureHoverEvent(map: Map) {
  if (map.get(FeaturesHoverEventType)) return;
  map.on("pointermove", async (event) => {
    const features = await readFeaturesAtPixel(map, event);
    map.dispatchEvent({
      type: FeaturesHoverEventType,
      features,
    } as unknown as BaseEvent);
  });
  map.set(FeaturesHoverEventType, true);
}

export function listen(
  map: Map,
  event: MapEventType,
  callback: (event: MapEvent) => void,
) {
  switch (event) {
    case FeaturesClickEventType:
      registerFeatureClickEvent(map);
      // we're using a custom event type here so we need to cast to unknown first
      map.on(event as unknown as MapObjectEventTypes, (event) => {
        callback(event as unknown as MapEvent);
      });
      break;
    case FeaturesHoverEventType:
      registerFeatureHoverEvent(map);
      // see comment above
      map.on(event as unknown as MapObjectEventTypes, (event) => {
        callback(event as unknown as MapEvent);
      });
      break;
    case MapClickEventType:
      map.on("click", (event) => {
        const coordinate = toLonLat(
          event.pixel,
          map.getView().getProjection(),
        ) as [number, number];
        callback({ coordinate });
      });
      break;
    default:
      throw new Error(`Unrecognized event type: ${event}`);
  }
}
