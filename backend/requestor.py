from google import genai
# import google.generativeai as genai

import os
from dotenv import load_dotenv
from openai import OpenAI

import openai

load_dotenv()

model_type = "OPENAI"

# KEY = os.getenv("GEMINI_KEY")
# openai.configure(api_key = KEY)
# model = "gemini-2.0-flash"
# project_model = genai.GenerativeModel(
#     model_name = model,
#     system_instruction = [
#         'You are an A.I. project manager that will help a team plan and build a project.',
#         'You will help this team break apart a project into managable JIRA-tickets based on the members and deadline',
#         'You will sometimes also facilitate standups and modify the jira tickets based on what people say',
#         'Always return dates in MM/DD/YY format'
#     ]
# )


client = OpenAI(api_key=os.getenv("OPENAI_KEY"))


def prompt(prompt: str):
    '''get a prompt from gpt'''

    response = project_model.generate_content(
        model=model, contents=prompt
    )

    return response.text

def prompt_project(prompt):

    if model_type == "GEMINI":
        response = project_model.generate_content(prompt)
        return response.text
    else:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": 'You are an A.I. project manager that will help a team plan and build a project. You will help this team break apart a project into managable JIRA-tickets based on the members and deadline. You will sometimes also facilitate standups and modify the jira tickets based on what people say, Always return dates in MM/DD/YY format. If given tickets to move around, make sure to return them all unless you split them into differnet ones.'},
                {"role": "user", "content": prompt},
            ],
            stream=False
        )
        return response.choices[0].message.content



    