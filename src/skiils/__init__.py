from .core import start_skiils, add_skill
from .skills.data import clean_list, calculate_stats
from .skills.text import word_count, summarize
from .skills.utils import get_time, hello_world
from .skills.ai import generate_prompt, simple_ai_chat
from .skills.file import list_files, save_to_file

__version__ = "0.4.0"
__all__ = [
    "start_skiils", "add_skill",
    "clean_list", "calculate_stats",
    "word_count", "summarize",
    "get_time", "hello_world",
    "generate_prompt", "simple_ai_chat",
    "list_files", "save_to_file"
]