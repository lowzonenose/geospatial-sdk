[geospatial-sdk](../../index.md) / [core](../index.md) / MapContextLayerWfs

# MapContextLayerWfs

## Extends

- [`MapContextBaseLayer`](MapContextBaseLayer.md)

## Properties

### extras?

```ts
extras?: LayerExtras;
```

This property can be used to store anything application-specific on layers; as its content may occasionally
be serialized to JSON for change detection purposes, it is not recommended to store Functions or other
non-serializable entities

#### Inherited from

[`core.MapContextBaseLayer.extras`](MapContextBaseLayer.md#extras)

#### Source

[packages/core/lib/model/map-context.ts:16](https://github.com/jahow/geospatial-sdk/blob/eda8b4f/packages/core/lib/model/map-context.ts#L16)

---

### featureType

```ts
featureType: string;
```

#### Source

[packages/core/lib/model/map-context.ts:38](https://github.com/jahow/geospatial-sdk/blob/eda8b4f/packages/core/lib/model/map-context.ts#L38)

---

### id?

```ts
id?: string | number;
```

#### Inherited from

[`core.MapContextBaseLayer.id`](MapContextBaseLayer.md#id)

#### Source

[packages/core/lib/model/map-context.ts:8](https://github.com/jahow/geospatial-sdk/blob/eda8b4f/packages/core/lib/model/map-context.ts#L8)

---

### type

```ts
type: "wfs";
```

#### Source

[packages/core/lib/model/map-context.ts:36](https://github.com/jahow/geospatial-sdk/blob/eda8b4f/packages/core/lib/model/map-context.ts#L36)

---

### url

```ts
url: string;
```

#### Source

[packages/core/lib/model/map-context.ts:37](https://github.com/jahow/geospatial-sdk/blob/eda8b4f/packages/core/lib/model/map-context.ts#L37)

---

### version?

```ts
version?: number;
```

#### Inherited from

[`core.MapContextBaseLayer.version`](MapContextBaseLayer.md#version)

#### Source

[packages/core/lib/model/map-context.ts:9](https://github.com/jahow/geospatial-sdk/blob/eda8b4f/packages/core/lib/model/map-context.ts#L9)

---

Generated using [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown) and [TypeDoc](https://typedoc.org/)
