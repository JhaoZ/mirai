import json
class MemberData:

    def __init__(self, name: str, age: int, working_description: str, resume: str, title: str, year_of_exp: int, employee_id: str):
        self.name = name
        self.working_description = working_description
        self.resume = resume 
        self.title = title
        self.year_of_exp = year_of_exp
        self.employee_id = employee_id
    
    def get_prompt_description(self):
        description = {}
        description['Name'] = self.name
        description['Working_Description'] = self.working_description
        description['Resume'] = self.resume
        description['Title'] = self.title
        description['Years_of_Experience'] = self.year_of_exp
        description['Employee_Id'] = self.employee_id


        return str(description)

    def get_json(self):
        description = {}
        description['Name'] = self.name
        description['Working_Description'] = self.working_description
        description['Resume'] = self.resume
        description['Title'] = self.title
        description['Years_of_Experience'] = self.year_of_exp
        description['Employee_Id'] = self.employee_id


        return json.dumps(description)
