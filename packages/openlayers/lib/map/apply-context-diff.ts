import Map from "ol/Map";
import { MapContextDiff } from "@geospatial-sdk/core";
import { createLayer } from "./create-map";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import SimpleGeometry from "ol/geom/SimpleGeometry";

const GEOJSON = new GeoJSON();

/**
 * Apply a context diff to an OpenLayers map
 * @param map
 * @param contextDiff
 */
export async function applyContextDiffToMap(
  map: Map,
  contextDiff: MapContextDiff,
): Promise<Map> {
  const layers = map.getLayers();

  // removed layers (sorted by descending position)
  if (contextDiff.layersRemoved.length > 0) {
    const removed = contextDiff.layersRemoved.sort(
      (a, b) => b.position - a.position,
    );
    for (const layerRemoved of removed) {
      layers.item(layerRemoved.position).dispose();
      layers.removeAt(layerRemoved.position);
    }
  }

  // insert added layers
  const newLayers = await Promise.all(
    contextDiff.layersAdded.map((layerAdded) => createLayer(layerAdded.layer)),
  );

  newLayers.forEach((layer, index) => {
    const position = contextDiff.layersAdded[index].position;
    if (position >= layers.getLength()) {
      layers.push(layer);
    } else {
      layers.insertAt(position, layer);
    }
  });

  // move reordered layers (sorted by ascending new position)
  if (contextDiff.layersReordered.length > 0) {
    const reordered = contextDiff.layersReordered.sort(
      (a, b) => a.newPosition - b.newPosition,
    );
    const olLayers = reordered.map((layer) =>
      layers.item(layer.previousPosition),
    );
    const layersArray = layers.getArray();
    for (let i = 0; i < reordered.length; i++) {
      layersArray[reordered[i].newPosition] = olLayers[i];
    }
    map.setLayers([...layersArray]);
  }

  // recreate changed layers
  for (const layerChanged of contextDiff.layersChanged) {
    layers.item(layerChanged.position).dispose();
    createLayer(layerChanged.layer).then((layer) => {
      layers.setAt(layerChanged.position, layer);
    });
  }

  if ("viewChanges" in contextDiff) {
    const { viewChanges } = contextDiff;
    const view = map.getView();
    if (!viewChanges) {
      return map;
    }
    if ("geometry" in viewChanges) {
      const geom = GEOJSON.readGeometry(viewChanges.geometry);
      view.fit(geom as SimpleGeometry, {
        size: map.getSize(),
      });
    } else if ("extent" in viewChanges) {
      view.fit(viewChanges.extent, {
        size: map.getSize(),
      });
    } else {
      const { center: centerInViewProj, zoom } = viewChanges;
      const center = centerInViewProj
        ? fromLonLat(centerInViewProj, "EPSG:3857")
        : [0, 0];
      view.setCenter(center);
      view.setZoom(zoom);
      if (viewChanges.maxZoom) {
        view.setMaxZoom(viewChanges.maxZoom);
      }
      // TODO: factorize this better
      // if (viewChanges.maxExtent) {
      //   map.setView(new View({
      //
      //   }))
      // }
    }
  }

  return map;
}
