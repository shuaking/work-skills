def word_count(text):
    return len(text.strip().split())

def summarize(text, max_len=60):
    cleaned = text.strip()
    return cleaned[:max_len] + ("..." if len(cleaned) > max_len else "")