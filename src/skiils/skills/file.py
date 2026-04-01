import json
from pathlib import Path

def list_files(directory: str = "."):
    return [f.name for f in Path(directory).iterdir() if f.is_file()][:10]

def save_to_file(data, filename: str = "skiils_output.txt"):
    Path(filename).write_text(str(data), encoding="utf-8")
    return f"✅ 已保存到 {filename}（长度 {len(str(data))} 字符）"