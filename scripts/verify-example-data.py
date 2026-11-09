#!/usr/bin/env python3
"""Check canonical student examples across independent runtimes without deps."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
fixture = json.loads((ROOT / "docs/example-data.json").read_text())
tasks = fixture["tasks"]
assert [item["title"] for item in tasks] == [
    "Підготуватися до семінару",
    "Виконати лабораторну роботу",
    "Завантажити звіт у Moodle",
]
assert [item["completed"] for item in tasks] == [False, True, False]
a, b, c = [task["title"] for task in tasks]

groups = {
    "first_3": [
        "examples/lecture-01-ui-system/app.js",
        "examples/lecture-01-ui-system/server.py",
        "examples/lecture-02-component-model/src/main.js",
        "examples/lecture-03-react-basics/src/App.jsx",
        "examples/lecture-04-state-events-forms/src/App.jsx",
        "examples/lecture-06-state-management/src/App.jsx",
        "examples/lecture-07-react-native-basics/App.js",
        "services/task-api/server.mjs",
        "examples/lecture-13-e2e-diagnostics/app/server.mjs",
    ],
    "first": [
        "examples/lecture-10-comparison/react-native/App.js",
        "examples/lecture-10-comparison/flutter/lib/main.dart",
        "examples/lecture-10-comparison/android-compose/TaskScreen.kt",
        "examples/lecture-10-comparison/android-compose/app/src/main/java/online/momentguide/lecture10/MainActivity.kt",
        "examples/lecture-12-component-testing/app/src/TaskEditor.jsx",
    ],
    "third": [
        "examples/lecture-11-electron/app/renderer/renderer.js",
        "examples/lecture-11-electron/app/renderer/index.html",
    ],
    "test_first": [
        "examples/lecture-05-routing-api/tests/screenshots.spec.js",
        "examples/lecture-08-navigation-state-data/tests/screenshots.spec.js",
        "examples/lecture-12-component-testing/app/src/TaskEditor.test.jsx",
        "examples/lecture-13-e2e-diagnostics/app/tests/e2e.spec.js",
    ],
}

checked = 0
for group, paths in groups.items():
    required = {"first_3": [a, b, c], "first": [a],
                "third": [c], "test_first": [a]}[group]
    for name in paths:
        text = (ROOT / name).read_text()
        if not all(value in text for value in required):
            raise AssertionError(f"Mismatch: {name} requires {required}")
        if group == "first_3":
            offsets = [text.index(value) for value in required]
            if offsets != sorted(offsets):
                raise AssertionError(f"Unexpected task order: {name}")
        checked += 1

# Student-facing labels from the old teacher-oriented examples are obsolete.
old = ["Підготувати лекцію", "Перевірити лабораторну",
       "Опублікувати матеріали", "Підготувати приклад маршрутизації",
       "Підготувати скріншоти лекції", "Перевірити обладнання в аудиторії",
       "Підготувати desktop-версію проєкту"]
for directory in ("examples", "services"):
    for path in (ROOT / directory).rglob("*"):
        if not path.is_file() or path.suffix not in (".js", ".jsx", ".py", ".kt", ".dart", ".html"):
            continue
        if any(part in ("node_modules", "dist", "build", ".expo") for part in path.parts):
            continue
        text = path.read_text()
        if any(label in text for label in old):
            raise AssertionError(f"Obsolete teacher-facing example: {path}")

# Check that the two source-of-truth implementations agree on initial states.
l1js = (ROOT / "examples/lecture-01-ui-system/app.js").read_text()
l1py = (ROOT / "examples/lecture-01-ui-system/server.py").read_text()
l2js = (ROOT / "examples/lecture-02-component-model/src/main.js").read_text()
for i, task in enumerate(tasks):
    ident = 41 + i
    title = task["title"]
    expected = str(task["completed"]).lower()
    assert f"id: {ident}, title: '{title}', completed: {expected}" in l1js
    assert f"id: {ident}, title: '{title}', completed: {expected}" in l2js
    assert f'"id": {ident}, "title": "{title}", "completed": {task["completed"]}' in l1py

assert "NEXT_ID = 44" in l1py
assert "let nextId = 44" in l2js
assert r"/\/tasks\/4$/" in (ROOT / "examples/lecture-13-e2e-diagnostics/app/tests/e2e.spec.js").read_text()

print(f"PASS: {checked} source/test files, three canonical titles, initial states, IDs and test contracts")
