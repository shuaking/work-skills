#!/usr/bin/env python3
"""
技能元数据提取脚本
扫描 src/skiils/skills/*.py 和 *.md 文件，提取技能定义并生成 docs/skills.json
"""
import ast
import json
import re
from pathlib import Path

# 类别映射配置
CATEGORY_MAP = {
    "data.py": {
        "category": "数据处理技能",
        "icon": "📊",
        "color": "cyan"
    },
    "text.py": {
        "category": "文本处理技能",
        "icon": "📝",
        "color": "magenta"
    },
    "ai.py": {
        "category": "AI 智能技能",
        "icon": "🤖",
        "color": "purple"
    },
    "file.py": {
        "category": "文件操作技能",
        "icon": "📁",
        "color": "orange"
    },
    "utils.py": {
        "category": "通用工具技能",
        "icon": "🛠️",
        "color": "yellow"
    },
    # Markdown 技能文档默认分类
    "default_md": {
        "category": "扩展技能",
        "icon": "🎨",
        "color": "indigo"
    }
}

# 函数描述映射（用于没有 docstring 的情况）
FUNCTION_DESCRIPTIONS = {
    "clean_list": "去重去空",
    "calculate_stats": "统计均值/总数",
    "word_count": "字数统计",
    "summarize": "智能摘要",
    "generate_prompt": "专业提示词生成",
    "simple_ai_chat": "模拟智能对话",
    "list_files": "列出目录文件",
    "save_to_file": "保存内容到文件",
    "get_time": "当前时间",
    "hello_world": "打招呼"
}


def extract_metadata_from_skill_folder(folder_path):
    """从技能文件夹中提取元数据（读取 SKILL.md）"""
    skill_md = folder_path / "SKILL.md"

    if not skill_md.exists():
        return None

    try:
        with open(skill_md, 'r', encoding='utf-8') as f:
            content = f.read()

        # 解析 frontmatter
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
        if not frontmatter_match:
            return None

        frontmatter = frontmatter_match.group(1)

        # 提取 description（支持多行）
        desc_match = re.search(r'description:\s*>?\s*\n?(.*?)(?=\n\w+:|$)', frontmatter, re.DOTALL)

        if desc_match:
            description = desc_match.group(1).strip()
            # 清理多行描述中的换行和多余空格
            description = ' '.join(line.strip() for line in description.split('\n') if line.strip())

            # 使用文件夹名作为技能名
            skill_name = folder_path.name

            return {
                "name": skill_name,
                "description": description[:100] + "..." if len(description) > 100 else description
            }

        return None
    except Exception as e:
        print(f"[WARNING] Failed to parse {skill_md}: {e}")
        return None


def extract_metadata_from_md(file_path):
    """从 Markdown 文件中提取技能元数据"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 解析 frontmatter
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
        if not frontmatter_match:
            return None

        frontmatter = frontmatter_match.group(1)

        # 提取 name 和 description
        name_match = re.search(r'name:\s*(.+)', frontmatter)
        desc_match = re.search(r'description:\s*(.+)', frontmatter)

        if name_match:
            name = name_match.group(1).strip()
            description = desc_match.group(1).strip() if desc_match else name

            return {
                "name": name,
                "description": description
            }

        return None
    except Exception as e:
        print(f"[WARNING] Failed to parse {file_path}: {e}")
        return None


def extract_functions_from_file(file_path):
    """从 Python 文件中提取函数定义"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            tree = ast.parse(f.read(), filename=str(file_path))

        functions = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # 跳过私有函数
                if node.name.startswith('_'):
                    continue

                # 提取 docstring
                docstring = ast.get_docstring(node)
                description = docstring.split('\n')[0] if docstring else None

                # 如果没有 docstring，使用预定义描述
                if not description:
                    description = FUNCTION_DESCRIPTIONS.get(node.name, "")

                functions.append({
                    "name": node.name,
                    "description": description
                })

        return functions
    except Exception as e:
        print(f"[WARNING] Failed to parse {file_path}: {e}")
        return []


def generate_skills_json():
    """生成技能 JSON 文件"""
    project_root = Path(__file__).parent.parent
    skills_dir = project_root / "src" / "skiils" / "skills"
    output_file = project_root / "docs" / "skills.json"

    if not skills_dir.exists():
        print(f"[ERROR] Skills directory not found: {skills_dir}")
        return False

    # 收集所有技能
    categories = {}
    processed_items = set()  # 记录已处理的项目，避免重复

    # 优先级 1: 处理文件夹（技能包）
    for item in skills_dir.iterdir():
        if item.is_dir() and not item.name.startswith('__'):
            metadata = extract_metadata_from_skill_folder(item)
            if metadata:
                # 使用默认的扩展技能分类
                category_info = CATEGORY_MAP["default_md"]
                category_name = category_info["category"]

                if category_name not in categories:
                    categories[category_name] = {
                        "category": category_name,
                        "icon": category_info["icon"],
                        "color": category_info["color"],
                        "skills": []
                    }

                categories[category_name]["skills"].append(metadata)
                processed_items.add(item.name)
                print(f"[INFO] Processed folder skill: {item.name}")

    # 优先级 2: 处理 Python 文件
    for py_file in skills_dir.glob("*.py"):
        # 跳过 __init__.py
        if py_file.name.startswith("__"):
            continue

        # 获取类别信息
        category_info = CATEGORY_MAP.get(py_file.name)
        if not category_info:
            print(f"[INFO] Skipping unmapped file: {py_file.name}")
            continue

        # 提取函数
        functions = extract_functions_from_file(py_file)
        if not functions:
            continue

        # 按类别分组
        category_name = category_info["category"]
        if category_name not in categories:
            categories[category_name] = {
                "category": category_name,
                "icon": category_info["icon"],
                "color": category_info["color"],
                "skills": []
            }

        categories[category_name]["skills"].extend(functions)
        processed_items.add(py_file.stem)

    # 优先级 3: 处理独立 Markdown 文件
    for md_file in skills_dir.glob("*.md"):
        # 跳过已处理的文件夹中的文件
        if md_file.stem in processed_items:
            continue

        metadata = extract_metadata_from_md(md_file)
        if not metadata:
            continue

        # 使用默认的扩展技能分类
        category_info = CATEGORY_MAP["default_md"]
        category_name = category_info["category"]

        if category_name not in categories:
            categories[category_name] = {
                "category": category_name,
                "icon": category_info["icon"],
                "color": category_info["color"],
                "skills": []
            }

        categories[category_name]["skills"].append(metadata)
        processed_items.add(md_file.stem)

    # 转换为列表格式
    skills_data = list(categories.values())

    # 写入 JSON 文件
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(skills_data, f, ensure_ascii=False, indent=2)

    # 统计信息
    total_skills = sum(len(cat["skills"]) for cat in skills_data)
    print(f"[SUCCESS] Generated {output_file}")
    print(f"[INFO] Total: {len(skills_data)} categories, {total_skills} skills")

    return True


if __name__ == "__main__":
    success = generate_skills_json()
    exit(0 if success else 1)
