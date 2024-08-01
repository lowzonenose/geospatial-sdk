import { MapContext, MapContextDiff, MapContextLayer } from "../model";
import { computeMapContextDiff } from "./map-context-diff";
import {
  SAMPLE_CONTEXT,
  SAMPLE_LAYER1,
  SAMPLE_LAYER2,
  SAMPLE_LAYER3,
  SAMPLE_LAYER4,
  SAMPLE_LAYER5,
} from "../../fixtures/map-context.fixtures";
import { MapContextView } from "../model";

describe("Context diff utils", () => {
  describe("computeMapContextDiff", () => {
    let contextOld: MapContext;
    let contextNew: MapContext;
    let diff: MapContextDiff;

    describe("no change", () => {
      beforeEach(() => {
        contextOld = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER2, SAMPLE_LAYER1],
        };
        contextNew = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER2, SAMPLE_LAYER1],
        };
      });
      it("outputs the correct diff", () => {
        diff = computeMapContextDiff(contextNew, contextOld);
        expect(diff).toEqual({
          layersAdded: [],
          layersChanged: [],
          layersRemoved: [],
          layersReordered: [],
          viewChanges: MapContextView,
        });
      });
    });

    describe("layers added", () => {
      beforeEach(() => {
        contextOld = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER1],
        };
        contextNew = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER2, SAMPLE_LAYER1, SAMPLE_LAYER4],
        };
      });
      it("outputs the correct diff", () => {
        diff = computeMapContextDiff(contextNew, contextOld);
        expect(diff).toEqual({
          layersAdded: [
            {
              layer: SAMPLE_LAYER2,
              position: 0,
            },
            {
              layer: SAMPLE_LAYER4,
              position: 2,
            },
          ],
          layersChanged: [],
          layersRemoved: [],
          layersReordered: [],
          viewChanges: MapContextView,
        });
      });
    });

    describe("layers removed", () => {
      beforeEach(() => {
        contextOld = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER2, SAMPLE_LAYER1, SAMPLE_LAYER4],
        };
        contextNew = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER4],
        };
      });
      it("outputs the correct diff", () => {
        diff = computeMapContextDiff(contextNew, contextOld);
        expect(diff).toEqual({
          layersAdded: [],
          layersChanged: [],
          layersRemoved: [
            {
              layer: SAMPLE_LAYER2,
              position: 0,
            },
            {
              layer: SAMPLE_LAYER1,
              position: 1,
            },
          ],
          layersReordered: [],
          viewChanges: MapContextView,
        });
      });
    });

    describe("layers changed", () => {
      beforeEach(() => {
        contextOld = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER2, { ...SAMPLE_LAYER1, id: 123, version: 3 }],
        };
        contextNew = {
          ...SAMPLE_CONTEXT,
          layers: [
            { ...SAMPLE_LAYER2, extras: { prop: true } },
            { ...SAMPLE_LAYER1, id: 123, version: 10 },
          ],
        };
      });
      it("outputs the correct diff", () => {
        diff = computeMapContextDiff(contextNew, contextOld);
        expect(diff).toEqual({
          layersAdded: [],
          layersChanged: [
            {
              layer: contextNew.layers[0],
              position: 0,
            },
            {
              layer: contextNew.layers[1],
              position: 1,
            },
          ],
          layersRemoved: [],
          layersReordered: [],
          viewChanges: MapContextView,
        });
      });
    });

    describe("reordering", () => {
      describe("three layers reordered", () => {
        beforeEach(() => {
          contextOld = {
            ...SAMPLE_CONTEXT,
            layers: [SAMPLE_LAYER1, SAMPLE_LAYER2, SAMPLE_LAYER3],
          };
          contextNew = {
            ...SAMPLE_CONTEXT,
            layers: [SAMPLE_LAYER2, SAMPLE_LAYER1, SAMPLE_LAYER3],
          };
        });
        it("outputs the correct diff", () => {
          diff = computeMapContextDiff(contextNew, contextOld);
          expect(diff).toEqual({
            layersAdded: [],
            layersChanged: [],
            layersRemoved: [],
            layersReordered: [
              {
                layer: SAMPLE_LAYER2,
                newPosition: 0,
                previousPosition: 1,
              },
              {
                layer: SAMPLE_LAYER1,
                newPosition: 1,
                previousPosition: 0,
              },
            ],
            viewChanges: MapContextView,
          });
        });
      });

      describe("four layers reordered", () => {
        beforeEach(() => {
          contextOld = {
            ...SAMPLE_CONTEXT,
            layers: [
              SAMPLE_LAYER1,
              SAMPLE_LAYER3,
              SAMPLE_LAYER4,
              SAMPLE_LAYER2,
            ],
          };
          contextNew = {
            ...SAMPLE_CONTEXT,
            layers: [
              SAMPLE_LAYER4,
              SAMPLE_LAYER3,
              SAMPLE_LAYER1,
              SAMPLE_LAYER2,
            ],
          };
        });
        it("outputs the correct diff", () => {
          diff = computeMapContextDiff(contextNew, contextOld);
          expect(diff).toEqual({
            layersAdded: [],
            layersChanged: [],
            layersRemoved: [],
            layersReordered: [
              {
                layer: SAMPLE_LAYER4,
                newPosition: 0,
                previousPosition: 2,
              },
              {
                layer: SAMPLE_LAYER1,
                newPosition: 2,
                previousPosition: 0,
              },
            ],
            viewChanges: MapContextView,
          });
        });
      });
    });

    describe("combined changes", () => {
      let changedLayer: MapContextLayer;
      beforeEach(() => {
        changedLayer = { ...SAMPLE_LAYER3, extras: { prop: true } };
        contextOld = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER1, SAMPLE_LAYER5, SAMPLE_LAYER3, SAMPLE_LAYER4],
        };
        contextNew = {
          ...SAMPLE_CONTEXT,
          layers: [SAMPLE_LAYER2, changedLayer, SAMPLE_LAYER5],
        };
      });
      it("outputs the correct diff", () => {
        diff = computeMapContextDiff(contextNew, contextOld);
        expect(diff).toEqual({
          layersAdded: [
            {
              layer: SAMPLE_LAYER2,
              position: 0,
            },
          ],
          layersChanged: [
            {
              layer: changedLayer,
              position: 1,
            },
          ],
          layersRemoved: [
            {
              layer: SAMPLE_LAYER1,
              position: 0,
            },
            {
              layer: SAMPLE_LAYER4,
              position: 3,
            },
          ],
          layersReordered: [
            {
              layer: changedLayer,
              newPosition: 1,
              previousPosition: 2,
            },
            {
              layer: SAMPLE_LAYER5,
              newPosition: 2,
              previousPosition: 1,
            },
          ],
          viewChanges: MapContextView,
        });
      });
    });
  });
});
