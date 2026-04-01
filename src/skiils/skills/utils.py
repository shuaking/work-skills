from datetime import datetime

def get_time(fmt="%Y-%m-%d %H:%M:%S"):
    return datetime.now().strftime(fmt)

def hello_world(name="朋友"):
    return f"你好，{name}！SKIILs 多技能库正在为你服务 ✨"