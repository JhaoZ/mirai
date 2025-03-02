
import random
import json

first_time = True
seen = set()

def next_ticket_number():
    global first_time

    if first_time:
        t = 123842
        seen.add(t)
        first_time = False
        return str(t)
    curr = random.randint(100000, 999999)
    while curr in seen:
        curr = random.randint(100000, 999999)
    seen.add(curr)

    return str(curr)



class Ticket:


    dev_type = ""
    title = ""
    description = ""
    assignments = []
    deadline = ""
    category = ""
    priority = 0
    ticket_num = ""



    def __init__(self, dev_type, title, description, assignments, deadline, category, priority, ticket_num = None):
        self.dev_type = dev_type
        self.title = title
        self.description = description
        self.assignments = assignments
        self.deadline = deadline
        self.category = category
        self.priority = priority

        if ticket_num == None:
            self.ticket_num = next_ticket_number()
        else:
            self.ticket_num = ticket_num

    def __str__(self):
        temp = {
            'dev_type':self.dev_type,
            'title': self.title,
            'ticket_num': self.ticket_num,
            'description': self.description,
            'assignments': self.assignments,
            'deadline': self.deadline,
            'category': self.category,
            'priority': self.priority
        }

        return str(temp)
    
    def get_json(self):
        temp = {
            'dev_type':self.dev_type,
            'title': self.title,
            'ticket_num': self.ticket_num,
            'description': self.description,
            'assignments': self.assignments,
            'deadline': self.deadline,
            'category': self.category,
            'priority': self.priority
        }

        return temp

