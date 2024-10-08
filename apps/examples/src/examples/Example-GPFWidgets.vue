<script setup lang="ts">
import { createMapFromContext } from '@geospatial-sdk/openlayers'
import { onMounted, ref } from 'vue'

import "geopf-extensions-openlayers/css/Classic.css"
import {
  Drawing,
  Isocurve,
  Route,
  LayerImport,
  GeoportalAttribution,
  GeoportalZoom,
  GeoportalOverviewMap,
  ElevationPath,
  MeasureArea,
  MeasureAzimuth,
  MeasureLength,
  LayerSwitcher,
  MousePosition as GeoportalMousePosition,
  ReverseGeocode,
  SearchEngine,
  GetFeatureInfo,
  CRS
} from 'geopf-extensions-openlayers'
import Gp from "geoportal-access-lib";

const mapRoot = ref<HTMLElement>()

onMounted(() => {
  var cfg = new Gp.Services.Config({
    customConfigFile : "https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json",
    onSuccess : () => {
      createMapFromContext(
        {
          layers: [
            {
              type: 'xyz',
              url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          ],
          view: {
            zoom: 5,
            center: [6, 48.5]
          }
        },
        mapRoot.value
      ).then((map) => {
        CRS.load();
        
        var drawing = new Drawing({
          position: "top-left"
        });
        map.addControl(drawing);

        var overmap = new GeoportalOverviewMap({
            position : "bottom-left"
        });
        map.addControl(overmap);

        var zoom = new GeoportalZoom({
          position: "bottom-left"
        });
        map.addControl(zoom);
        
        var iso = new Isocurve({
          position: "bottom-left"
        });
        map.addControl(iso);

        var layerImport = new LayerImport({
          position: "bottom-left"
        });
        map.addControl(layerImport);

        var layerSwitcher = new LayerSwitcher({
          options: {
            position: "top-right"
          }
        });
        map.addControl(layerSwitcher);

        var mp = new GeoportalMousePosition({
          position: "top-right"
        });
        map.addControl(mp);

        var route = new Route({
          position: "top-right"
        });
        map.addControl(route);

        var reverse = new ReverseGeocode({
          position: "top-right"
        });
        map.addControl(reverse);

        var search = new SearchEngine({
          position: "top-right"
        });
        map.addControl(search);

        var feature = new GetFeatureInfo({
          options: {
            position: "top-right"
          }
        });
        map.addControl(feature);

        var measureLength = new MeasureLength({
          position: "bottom-left"
        });
        map.addControl(measureLength);

        var measureArea = new MeasureArea({
          position: "bottom-left"
        });
        map.addControl(measureArea);
        var measureAzimuth = new MeasureAzimuth({
          position: "bottom-left"
        });
        map.addControl(measureAzimuth);

        var measureProfil = new ElevationPath({
          position: "bottom-left"
        });
        map.addControl(measureProfil);

        var attributions = new GeoportalAttribution({
          position : "bottom-right"
        });
        map.addControl(attributions);
        })
    },
    onFailure : (e: any) => {
        console.error(e);
    }
  });
  cfg.call();
})
</script>

<template>
  <div ref="mapRoot" class="w-full h-full"></div>
</template>
