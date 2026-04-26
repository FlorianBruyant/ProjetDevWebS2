import os
import ast

def analyze_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        parsed = ast.parse(content)
        funcs = []
        for node in ast.iter_child_nodes(parsed):
            if isinstance(node, ast.FunctionDef):
                funcs.append(node.name)
            elif isinstance(node, ast.ClassDef):
                for sub in node.body:
                    if isinstance(sub, ast.FunctionDef):
                        funcs.append(f"{node.name}.{sub.name}")
        return funcs
    except Exception as e:
        return []

for root, dirs, files in os.walk('backend'):
    if 'migrations' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            path = os.path.join(root, file)
            funcs = analyze_file(path)
            if funcs:
                print(f"File: {path} - Functions: {', '.join(funcs)}")
