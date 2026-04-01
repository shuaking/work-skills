def clean_list(items):
    return list(dict.fromkeys(x for x in items if x is not None))

def calculate_stats(numbers):
    if not numbers:
        return {"mean": 0, "count": 0}
    mean = round(sum(numbers) / len(numbers), 2)
    return {"mean": mean, "count": len(numbers)}