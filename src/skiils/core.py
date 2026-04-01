def start_skiils(task: str = "默认任务"):
    """SKIILs 主入口"""
    return f"✅ SKIILs 已启动任务：{task}！"

def add_skill(name: str, func):
    """动态注册新技能"""
    print(f"🚀 新技能 {name} 已注册")
    return func