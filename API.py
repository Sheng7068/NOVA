# Import the os package
import os

# Import the openai package
from openai import OpenAI

def ask_GPT(model_name: str, user_added_prompts, already_made_suggestions, code, stream: bool = True):
    """
    Examples of chat completions from the proxy
    """
    if code == "":
        return "NA"
    if user_added_prompts == []: # edge case: bro didn't want GPT to help
        return "NA"
    appended_prompts = ""
    for user_added_prompt in user_added_prompts:
        keyword, description = user_added_prompt
        appended_prompts += f"{keyword} - {description}\n"
    appended_suggestions = ""
    if already_made_suggestions == []:
        appended_suggestions = "There have not been any already made suggestions."
    else:
        for already_made_suggestion in already_made_suggestions:
            n, substring, suggestion = already_made_suggestion
            appended_suggestions += f"{n} ### {substring} ### {suggestion}\n===\n"
        appended_suggestions = appended_suggestions[:-4]
    client = OpenAI(
        api_key="sk-u5QdObyVhpFV-auOr44nDw", # set this!!!
        base_url="https://nova-litellm-proxy.onrender.com" # and this!!!
    )

    response = client.chat.completions.create(
        model=model_name,
        messages = [
            {
                "role": "system",
                "content": f'''You are simulating a code reviewer. You will be provided with a block of code with line numbers, a list of suggestions that the user wants you to make, and a list of already made suggestions. This list of suggestions that the user wants you to make will contain a keyword and description in the format ‘keyword - description’. The list of already made suggestions will be in the form:

n ### text to highlight ### suggestion
===
n ### text to highlight ### suggestion
===
n ### text to highlight ### suggestion

And so on.

Your goal is to find new suggestions that the user wants you to make for the code. Format your suggestions like so:

n ### text to highlight ### suggestion
===
n ### text to highlight ### suggestion
===
n ### text to highlight ### suggestion

and so on. ‘n’ is a singular line number, ‘text to highlight’ is a substring of the code on line n, and ‘suggestion’ is the suggestion you would make, in the form ‘[keyword]: sentence’. The sentence should be a polite command.

Do not recommend new suggestions that are repetitive or similar in nature to already made suggestions. If there are no new meaningful suggestions, say “NA”. 

Your suggestion list from the user is as follows:
{appended_prompts}
{appended_suggestions}
'''
            },
            {   "role": "user",
                "content": code
            }
        ],
        stream=stream
    )
    # print(response.choices[0].message.content)
    return response.choices[0].message.content
    # final_response = ""
    # for chunk in response:
    #     if chunk.choices[0].delta.content != None:
    #         final_response += chunk.choices[0].delta.content
    # return final_response

def parse_suggestions(suggestions):
    # returns a list of tuple, [(int, string, string)], for
    # line number, substring, and idea
    res = []
    if suggestions.strip() == "NA": return [] # nothing to add
    suggestions = suggestions.split("===")
    for suggestion in suggestions:
        suggestion = suggestion.strip().split("###")
        line_number = int(suggestion[0].strip())
        substring = suggestion[1].strip()
        final_suggestion = suggestion[2].strip()
        res.append((line_number, substring, final_suggestion))
    return res


def prompt_GPT(previous_suggestions, user_added_prompts, code):
    # code in form
    # 1 def factorial(n):
    # 2     if n <= 0: return 1
    # 3     else: return n * factorial(n - 1)

    # previous_suggestions is a list of tuple (n, substring, comment)

    # user_added_prompts is a list of tuple (keyword, description)
    suggestions = ask_GPT("openai/gpt-4o", user_added_prompts, previous_suggestions, code, stream=False)
    parsed_suggestions = parse_suggestions(suggestions)
    # print(parsed_suggestions)
    return parsed_suggestions

code = "def factorial(n): return 1"
previous_suggestions = []
user_added_prompts = [("correctness", "make sure that the code is correct based on the context of what is being written. Infer what a function is trying to do, and think about edge cases and other non-obvious inputs that could crash the function or cause it to return some incorrect value. Don’t make any suggestions on correctness if it is unclear what the function is trying to do. You want to minimize the number of false positives."),
                          ("style", "only look for misspellings.")]
previous_suggestions = prompt_GPT(previous_suggestions, user_added_prompts, code)
prompt_GPT(previous_suggestions, user_added_prompts, code)
