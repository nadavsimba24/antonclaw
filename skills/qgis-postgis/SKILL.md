---
name: qgis-postgis
description: "QGIS and PostGIS geospatial integration — run spatial SQL queries, analyze geographic data, perform GIS operations, calculate distances/areas/intersections, export GeoJSON. Use when the user asks about maps, spatial analysis, coordinates, shapefiles, geographic calculations, or PostGIS databases."
metadata:
  {
    "openclaw":
      {
        "emoji": "🗺",
        "requires": { "env": ["POSTGIS_CONNECTION_STRING"] },
        "install": [],
      },
  }
allowed-tools: ["bash"]
---

# QGIS / PostGIS Geospatial

Run spatial SQL via `psql` against a PostGIS-enabled PostgreSQL database.

## Setup

```
POSTGIS_CONNECTION_STRING=postgresql://user:pass@localhost:5432/geodata
```

## Run spatial queries

```bash
psql "$POSTGIS_CONNECTION_STRING" -c "SELECT version();"
```

## Core spatial patterns

### Find features within distance
```sql
SELECT name, ST_Distance(geom::geography, ST_MakePoint(34.78, 32.08)::geography) AS dist_m
FROM poi
WHERE ST_DWithin(geom::geography, ST_MakePoint(34.78, 32.08)::geography, 5000)
ORDER BY dist_m;
```

### Count features per polygon (e.g. buildings per neighborhood)
```sql
SELECT n.name, COUNT(b.id) AS building_count
FROM neighborhoods n
JOIN buildings b ON ST_Contains(n.geom, b.geom)
GROUP BY n.name ORDER BY building_count DESC;
```

### Area calculation
```sql
SELECT name, ST_Area(geom::geography) / 1e6 AS area_km2
FROM zones WHERE type = 'agricultural';
```

### Buffer and intersect
```sql
SELECT a.id, a.name
FROM parcels a
WHERE ST_Intersects(a.geom,
  ST_Buffer(ST_MakePoint(34.78, 32.08)::geography, 1000)::geometry);
```

### Spatial clustering (find nearby groups)
```sql
SELECT ST_ClusterDBSCAN(geom, eps := 200, minpoints := 3) OVER() AS cluster_id, *
FROM incidents;
```

### Export as GeoJSON
```sql
SELECT json_build_object(
  'type', 'FeatureCollection',
  'features', json_agg(ST_AsGeoJSON(t.*)::json)
) FROM (SELECT id, name, geom FROM my_table WHERE ...) t;
```

### Transform coordinate system
```sql
SELECT ST_Transform(geom, 4326) FROM my_table WHERE id = 1;
```

## Bash: run query and save GeoJSON
```bash
psql "$POSTGIS_CONNECTION_STRING" -t -c \
  "SELECT ST_AsGeoJSON(geom) FROM parcels LIMIT 100" \
  > parcels.geojson
```

## Common SRIDs

| SRID | Description |
|------|-------------|
| 4326 | WGS84 (GPS lat/lon) |
| 32636 | UTM Zone 36N (Israel/Middle East) |
| 2039 | ITM — Israel Transverse Mercator |
| 3857 | Web Mercator (OpenStreetMap, Google) |

## List spatial tables
```sql
SELECT f_table_name, f_geometry_column, type, srid
FROM geometry_columns ORDER BY f_table_name;
```

## Rules

1. Always check SRID before distance/area — use `geography` type for meter-based results
2. Add `LIMIT` or bounding box filter for large tables before full scans
3. Run `ST_IsValid(geom)` check on imported data before union/intersection
4. Never `DROP TABLE` or `TRUNCATE` without explicit confirmation
