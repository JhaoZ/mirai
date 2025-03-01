from requestor import prompt, start_project
from datetime import datetime
from member import MemberData
import json
from ticket import Ticket

#pip install grpcio==1.60.1


class Project:

    members = []

    todo = []
    inprogress = []
    qa = []
    pr = []
    closed = []


    def __init__(self, title = "", description = ""):
        self.title = title
        self.description = description
        self.deadline = ""
        self.techstack = ""
        self.shareholder =""
        self.intensity = ""
        self.github_link = ""

    def add_details(self, title, description, deadline = "", techstack ="", shareholder = "", intensity = "", github_link = ""):
        self.title = title
        self.description = description
        self.deadline = deadline
        self.techstack = techstack
        self.shareholder  = shareholder
        self.intensity = intensity
        self.github_link = github_link

    def addMember(self, member: MemberData):
        self.members.append(member)

    def make_ticket_from_json(self, ticket_json):
        title = str(ticket_json['title'])
        description = str(ticket_json['description'])
        assignments = ticket_json['assignments']
        deadline = str(ticket_json['deadline'])
        category = str(ticket_json['category'])
        priority = int(ticket_json['priority'])

        if "ticket_num" in ticket_json:
            ticket_num = str(ticket_json['ticket_num'])
            t = Ticket(title, description, assignments, deadline, category, priority, ticket_num)
        else:
            t = Ticket(title, description, assignments, deadline, category, priority)
        
        return t


    def distribute_tickets(self, tickets):
        # ERASES THE TICKETS

        self.todo = []
        self.inprogress = []
        self.qa = []
        self.pr = []
        self.closed = []


        for t in tickets:
            ticket = self.make_ticket_from_json(t)
            
            if ticket.category == "TODO":
                self.todo.append(ticket)
            elif ticket.category == "PROGRESS":
                self.inprogress.append(ticket)
            elif ticket.category == "QA":
                self.qa.append(ticket)
            elif ticket.category == "PR":
                self.pr.append(ticket)
            elif ticket.category == "CLOSED":
                self.closed.append(ticket)
        

    def generate_project(self):

        if len(self.members) == 0:
            return -1

        prompt = f"You will be given a project and its details. Ignore fields that are empty. If deadline if empty, make sure to choose an appropriate deadline given project scope. Today's date is {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        prompt += "Break this project into manageable jira tickets. There are 5 categories: Todo, In Progress, QA, PR, and Closed. The tickets can be moved between each. When the project is starting please place all tickets in Todo, unless it is QA related, then place it in QA\n"

        prompt += "Here is the project details: \n"

        prompt += f'''
            <title>{self.title}</title>
            <description>{self.description}</description>
            <deadline>{self.deadline}</deadline>
            <techstack>{self.techstack}</techstack>
            <shareholder>{self.shareholder}</shareholder>
            <intensity>{self.intensity}</intensity>\n
        '''
    
        prompt += "Now I will give you a list of members of this team as well as their details. Please assign them to tickets, and you can assign more than one to a single ticket. Try not to overload someone, unless their description says otherwise. I will give you the data via a list of jsons, each representing a member\n"

        for member in self.members:
            prompt += member.get_prompt_description()
            prompt += "\n"
        
        prompt += "Please respond with a list of tickets in a json format. Here is the expected format: \n"

        prompt += '''
        {
            'title': The Ticket Title
            'description': Description of the ticket and what needs to be done
            'assignments': [List of members assigned to this ticket, by employee ID]
            'deadline': Date for when this ticket should be completed
            'category': Category type of this ticket with this specfic string: (TODO, PROGRESS, QA, PR, CLOSED)
            'priority': A number from 1 to 5, where 1 is low priority, and 5 is high priority, for this ticket
        }\n
        '''

        prompt += "DO NOT REPLY WITH ANYTHING OTHER THAN THE TICKETS in a list of JSON as your output will be directly used in the backend of the jira board. Give the raw json text only, do not add any markdown.\n"

        try: 
            response = start_project(prompt=prompt)
        except Exception as e:
            return jsonify({"Error": "Ticket Generation Failed (GEMINI)"}), 400

        response = response[7:-3] # cause gemini keeps giving markdown
        curr = json.loads(response)
        
        self.distribute_tickets(curr)

        return 1








        