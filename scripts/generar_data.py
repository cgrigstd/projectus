import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIRECTORY_PATH = ROOT / "directorio_proyectos.json"
PROJECTS_PATH = ROOT / "proyectos.json"
OUTPUT_PATH = ROOT / "data.js"


def read_json(path):
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def dump_json(value):
    return json.dumps(value, ensure_ascii=False, indent=2).replace("\n", "\r\n")


def main():
    directory = read_json(DIRECTORY_PATH)
    projects = read_json(PROJECTS_PATH)
    content = (
        "window.DIRECTORIO_DATA = " + dump_json(directory) + ";\r\n"
        "window.PROYECTOS_DATA = " + dump_json(projects) + ";\r\n"
    )
    with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as file:
        file.write(content)


if __name__ == "__main__":
    main()
