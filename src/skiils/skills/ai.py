def generate_prompt(topic: str, style: str = "专业"):
    styles = {"专业": "严谨结构化", "创意": "生动有趣", "简洁": "高效直接"}
    return f"""你是一个极具{styles.get(style, style)}的AI专家。请针对「{topic}」给出专业回答。"""

def simple_ai_chat(message: str):
    import random
    replies = ["好的，我明白了！🚀", "这是一个很棒的问题！", "让我帮你一步步分析..."]
    return f"🤖 SKIILs AI: {random.choice(replies)}（输入：{message[:60]}...）"