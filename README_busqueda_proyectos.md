# Directorio de fuentes para un buscador de proyectos

## Propósito

El archivo `directorio_proyectos.json` contiene una colección de sitios web y búsquedas organizados por categorías. Estos enlaces son **fuentes de información para construir una herramienta que encuentre proyectos realizables** buscando en esos sitios.

La herramienta objetivo debería ayudar a descubrir proyectos que otras personas hayan desarrollado y documentado, desde actividades para principiantes hasta trabajos de ingeniería avanzada.

## Objetivo de la herramienta

Construir un buscador o agregador de proyectos que consulte las fuentes incluidas en el JSON y reúna resultados en un catálogo unificado. No se trata solamente de mostrar tutoriales: el objetivo es localizar proyectos que puedan reproducirse, estudiarse, modificarse o utilizarse como punto de partida para nuevos desarrollos.

## Qué debería encontrar

Priorizar publicaciones que incluyan, cuando estén disponibles:

- Descripción y objetivo del proyecto.
- Instrucciones de construcción paso a paso.
- Lista de materiales o componentes (BOM).
- Herramientas necesarias.
- Esquemas electrónicos, diagramas y planos.
- Archivos de diseño, CAD, PCB o modelos 3D.
- Código fuente, firmware y configuraciones.
- Fotografías, videos y documentación del proceso.
- Mediciones, pruebas, calibración y resultados.
- Costos estimados y alternativas de componentes.

No todos los proyectos tendrán todos estos elementos. La herramienta debería indicar qué documentación está disponible y evitar presentar como completo un proyecto que no lo está.

## Categorías iniciales

Las fuentes del JSON están agrupadas en áreas como:

- Repositorios y comunidades maker.
- Electrónica, Arduino, sensores e instrumentación.
- Hardware open source y código.
- Mecánica, CNC, impresión 3D y fabricación digital.
- Computación física y Raspberry Pi.
- Audio y acústica.
- Búsquedas directas de proyectos y documentación.

Estas categorías sirven como punto de partida. Un mismo proyecto puede pertenecer a varias disciplinas.

## Funcionalidades deseadas

1. **Búsqueda unificada:** buscar palabras clave en varias fuentes y reunir los resultados.
2. **Filtros:** permitir filtrar por categoría, disciplina, idioma, dificultad, presupuesto y tipo de proyecto.
3. **Calidad de documentación:** identificar si el proyecto incluye BOM, planos, esquemas, código, instrucciones y resultados de pruebas.
4. **Nivel técnico:** clasificar de forma orientativa desde principiante hasta avanzado o profesional, indicando cuando el nivel no esté especificado por la fuente.
5. **Ficha de proyecto:** mostrar título, resumen, autor o comunidad, fuente original, enlace, fecha si está disponible y recursos incluidos.
6. **Deduplicación:** detectar publicaciones repetidas o el mismo proyecto compartido en distintos sitios.
7. **Enlaces a la fuente original:** conservar siempre el enlace para consultar la documentación completa en el sitio de origen.

## Criterios importantes

- Respetar las condiciones de uso, licencias, políticas de acceso y límites de consulta de cada sitio.
- Preferir APIs, feeds RSS, buscadores internos o mecanismos de integración permitidos.
- No asumir que todos los sitios permiten rastreo automatizado o extracción de contenido.
- Guardar la URL y atribución de cada resultado.
- Diferenciar los datos confirmados por la fuente de las clasificaciones estimadas por la herramienta.
- No inventar materiales, costos, precisión, resultados ni instrucciones que no estén documentados.
- Para proyectos de seguridad crítica —por ejemplo, detectores de radiación, equipos eléctricos de alta tensión o dispositivos médicos— mostrar advertencias y exigir especial atención a calibración, validación y riesgos.

## Estructura de datos sugerida para cada proyecto

```json
{
  "title": "Nombre del proyecto",
  "summary": "Descripción breve",
  "source_name": "Nombre del sitio",
  "source_url": "https://...",
  "categories": ["electrónica", "instrumentación"],
  "language": "es",
  "difficulty": "intermedio",
  "estimated_budget": null,
  "materials_list_available": true,
  "schematics_available": true,
  "cad_files_available": false,
  "source_code_available": true,
  "build_instructions_available": true,
  "test_results_available": false,
  "last_checked": null
}
```

Este esquema es orientativo. Los campos desconocidos deben quedar vacíos o como `null`, no completarse mediante suposiciones.

## Relación entre los archivos

- `directorio_proyectos.json`: inventario de sitios y búsquedas que la herramienta puede utilizar como fuentes.
- Este documento (`README_busqueda_proyectos.md`): describe el propósito de esas fuentes y el tipo de herramienta que se quiere construir.

**Resultado esperado:** una herramienta que permita descubrir proyectos de distintas disciplinas y niveles, comparar su documentación y llegar rápidamente a las instrucciones, materiales y archivos necesarios para intentar construirlos.
