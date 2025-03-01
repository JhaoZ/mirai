from google import genai
import google.generativeai as genai

import os
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv("GEMINI_KEY")
genai.configure(api_key = KEY)
model = "gemini-2.0-flash"
project_model = genai.GenerativeModel(
    model_name = model,
    system_instruction = [
        'You are an A.I. project manager that will help a team plan and build a project.',
        'You will help this team break apart a project into managable JIRA-tickets based on the members and deadline',
        'You will sometimes also facilitate standups and modify the jira tickets based on what people say',
        'Always return dates in MM/DD/YY format'
    ]
)

def prompt(prompt: str):
    '''get a prompt from gpt'''

    response = project_model.generate_content(
        model=model, contents=prompt
    )

    return response.text

def start_project(prompt):
    response = project_model.generate_content(prompt)
    return response.text

    