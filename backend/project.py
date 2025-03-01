from requestor import prompt, prompt_project
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

    dev_storage = {}


    def __init__(self, title = "", description = ""):
        self.title = title
        self.description = description
        self.deadline = ""
        self.techstack = ""
        self.shareholder =""
        self.intensity = ""
        self.github_link = ""
        self.github_token = ""

    def add_details(self, title, description, deadline = "", techstack ="", shareholder = "", intensity = "", github_link = "", github_token = ""):
        self.title = title
        self.description = description
        self.deadline = deadline
        self.techstack = techstack
        self.shareholder  = shareholder
        self.intensity = intensity
        self.github_link = github_link
        self.github_token = github_token

    def addMember(self, member: MemberData):
        self.members.append(member)

    def make_ticket_from_json(self, ticket_json):
        dev_type = str(ticket_json['dev_type'])
        title = str(ticket_json['title'])
        description = str(ticket_json['description'])
        assignments = ticket_json['assignments']
        deadline = str(ticket_json['deadline'])
        category = str(ticket_json['category'])
        priority = int(ticket_json['priority'])


        if "ticket_num" in ticket_json:
            ticket_num = str(ticket_json['ticket_num'])
            t = Ticket(dev_type, title, description, assignments, deadline, category, priority, ticket_num)
        else:
            t = Ticket(dev_type, title, description, assignments, deadline, category, priority)
        
        return t


    def distribute_tickets(self, tickets):
        # ERASES THE TICKETS

        self.dev_storage = {} #dev_type -> {"todo":[], "progress":[], "qa":[]...}

        self.todo = []
        self.inprogress = []
        self.qa = []
        self.pr = []
        self.closed = []

        ticket_counter = 0 

        for t in tickets:
            ticket_counter += 1
            ticket = self.make_ticket_from_json(t)
            dev_type = ticket.dev_type

            if dev_type not in self.dev_storage:
                self.dev_storage[dev_type] = {
                    "TODO": [],
                    "PROGRESS": [],
                    "QA": [],
                    "PR": [],
                    "CLOSED": [],
                }
            
            if ticket.category in self.dev_storage[dev_type]:
                self.dev_storage[dev_type][ticket.category].append(ticket)

        print(f"Total number of tickets: {ticket_counter}")



        # for t in tickets:
        #     ticket = self.make_ticket_from_json(t)
            
        #     if ticket.category == "TODO":
        #         self.todo.append(ticket)
        #     elif ticket.category == "PROGRESS":
        #         self.inprogress.append(ticket)
        #     elif ticket.category == "QA":
        #         self.qa.append(ticket)
        #     elif ticket.category == "PR":
        #         self.pr.append(ticket)
        #     elif ticket.category == "CLOSED":
        #         self.closed.append(ticket)
        

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
 
        
        prompt += '''Please respond with a list of tickets in a json format for each of the following categories of development: 
            1. Planning & Research - "P&R"
            2. UX/UI Design        - "Design"
            3. Backend Development - "Backend"
            4. Frontend Development - "Frontend"
            5. Admin Dashboard     - "Admin"
            6. Marketing & Outreach - "Marketing"

        Note, not all projects will need tickets for all of these; choose depending on the project type. The number of tickets within each category also does not need to be uniform. But please provide at least 10 tickets.
        
        Here is the expected format: \n
        '''

        prompt += '''
        {
            'dev_type': the id/number representing one of the aformentioned categories of development, I made those clear with the dash and then the word I want to be used as the id.
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
            response = prompt_project(prompt=prompt)
        except Exception as e:
            return -1
                
        #    response = response[7:-3] # cause gemini keeps giving markdown

        curr = json.loads(response)

        
        self.distribute_tickets(curr)

        return 1

    def get_tickets_json(self):
        json_str = ""
        tickets = self.compile_tickets()

        str_ticket = json.dumps([t.get_json() for t in tickets])
        return str_ticket
        

    def compile_tickets(self):
        total_tickets = []
        
        # dev_type -> {"todo":[], "progress":[], "qa":[]...}

        for type, tickets in self.dev_storage.items():
            for ticket in tickets.values():
                if ticket != []:
                    total_tickets += ticket
        # print(f"TOTAL TICKETS: {total_tickets}")

        # for i in self.todo:
        #     total_tickets.append(i)
        
        # for i in self.inprogress:
        #     total_tickets.append(i)

        # for i in self.qa:
        #     total_tickets.append(i)

        # for i in self.pr:
        #     total_tickets.append(i)

        # for i in self.closed:
        #     total_tickets.append(i)

        return total_tickets
    
    def get_total_ticket_as_str(self):
        total_tickets = self.compile_tickets()
        end = ""
        for t in total_tickets:
            end += str(t) + '\n'
        return end

    def debug_tickets(self):
        print(self.dev_storage)
        for type, tickets in self.dev_storage.items(): # {key -> []}
            # print(tickets)
            print(f"{type}: ")
            for ticket in tickets.values():
                for t in ticket:
                    print(str(t))




        # print("TODO: ")
        # for i in self.todo:
        #     print(str(i))
        
        # print("IN PROGRESS:")
        # for i in self.inprogress:
        #     print(str(i))

        # print("QA: ")
        # for i in self.qa:
        #     print(str(i))

        # print("PR: ")
        # for i in self.pr:
        #     print(str(i))

        # print("CLOSED: ")
        # for i in self.closed:
        #     print(str(i))

        


    def standup(self, standup_query, user_id):

        prompt = f"You will be given a project and its details. Ignore fields that are empty. If deadline if empty, make sure to choose an appropriate deadline given project scope. Today's date is {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        prompt += "There are tickets that you have generated before, and now this is weekly standup and a user is now giving feedback on what they did over the week."

        prompt += "Here is the project details: \n"

        prompt += f'''
            <title>{self.title}</title>
            <description>{self.description}</description>
            <deadline>{self.deadline}</deadline>
            <techstack>{self.techstack}</techstack>
            <shareholder>{self.shareholder}</shareholder>
            <intensity>{self.intensity}</intensity>\n
        '''

        prompt += 'Here are the tickets, in json fashion: \n'

        prompt += self.get_total_ticket_as_str() + '\n'

        # print(f"TICKETS INPUTTED INTO PROMPT: {self.get_total_ticket_as_str()}")


        prompt += "Here are the members of the team: \n"

        for member in self.members:
            prompt += member.get_prompt_description()
            prompt += "\n"

        prompt += f'''CRITICAL INFORMATION: Standup just occurred, and user {user_id} said '{standup_query}'.\n please rearrange the tickets to reflect this.
        
        NEVER get rid of tickets (they are immutable), if a ticket is finished, please set its category to CLOSED. If a user is struggling to finish a ticket, move the ticket to closed, and make a new one with a longer deadlinea and changed scope.
        If a team member leaves, place the tickets that they worked with to CLOSED, and then generate new tickets for others to work on.
        The general workflow of tickets is TODO -> PROGRESS -> QA -> PR -> CLOSED.

        You may move a ticket to CLOSED and generate (one or more) new tickets with updated assignments and deadlines if someone is struggling with a ticket.

        ONCE AGAIN: CRITICAL THAT YOU NEVER REMOVE A TICKET. ALL TICKETS GIVEN TO YOU MUST BE RETURNED TO ME WITH STATUS UPDATED TO REFLECT STANDUP.

        Keep all details of the tickets the same when you return them to me.
        '''

        prompt += "Here is the expected format: \n"
        prompt += '''
        {
            'dev_type': [P&R,Design,Backend,Frontend,Admin,Marketing] - never change the ticket dev_type
            'title': The Ticket Title
            'ticket_num': Ticket Number (if you made new tickets, do not add this field) - never change the ticket number, it should be the same as before
            'description': Description of the ticket and what needs to be done
            'assignments': [List of members assigned to this ticket, by employee ID]
            'deadline': Date for when this ticket should be completed
            'category': Category type of this ticket with this specfic string: (TODO, PROGRESS, QA, PR, CLOSED). Please set this field to CLOSED if the user sid they are finished with it, or in progress if they are working on it. And after they are working on it, place it in QR, and then PR. 
            'priority': A number from 1 to 5, where 1 is low priority, and 5 is high priority, for this ticket
        }\n
        '''

        prompt += "DO NOT REPLY WITH ANYTHING OTHER THAN THE TICKETS in a list of JSON as your output will be directly used in the backend of the jira board. GIVE THE RAW JSON TEXT ONLY, DO NOT ADD ANY MARKDOWN. GIVE THE RAW JSON TEXT ONLY, DO NOT ADD ANY MARKDOWN. GIVE THE RAW JSON TEXT ONLY, DO NOT ADD ANY MARKDOWN. GIVE THE RAW JSON TEXT ONLY, DO NOT ADD ANY MARKDOWN.\n"

        prompt += "!!!REMINDER TO RETURN ALL TICKETS I GIVE YOU AND NEW ONES NEEDED"
        
        prompt += "DO NOT CHANGE THE TICKET NUMBER FIELD IF IT IS ALREADY GIVEN TO YOU"

        try: 
            response = prompt_project(prompt=prompt)
        except Exception as e:
            print(e)
            return -1

        # response = response[7:-3] # cause gemini keeps giving markdown

        curr = json.loads(response)

        print(curr)
        
        self.distribute_tickets(curr)

        return 1


    def analyze_github_commit(self, commit_code):
        prompt += "Given code for a commit, analyze and provide some feedback. Do not exceed 4 sentences and do not provide any code of yourself. Just comment on style and possible bugs.\n"
        prompt += "Here are the project details that this commit belongs to:\n"
        prompt += f'''
            <title>{self.title}</title>
            <description>{self.description}</description>
            <deadline>{self.deadline}</deadline>
            <techstack>{self.techstack}</techstack>
            <shareholder>{self.shareholder}</shareholder>
            <intensity>{self.intensity}</intensity>\n
        '''
        prompt += f"The code is as follows:\n\n"
        prompt += commit_code
        
        return requestor.prompt_project(prompt)
        








        