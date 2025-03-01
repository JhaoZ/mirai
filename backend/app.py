from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
import PyPDF2
from member import MemberData
from project import Project
from git_handler import GitHubRepo
from ticket import Ticket
import json


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

currentProject = None
gitHandler = None

# WORKFLOW -> /init_project -> /init_project_details -> /add_member -> /start_project

@app.route('/', methods = ['GET'])
def home():
    return jsonify({'Home':'home'})

@app.route("/init_project", methods = ['POST'])
def init_project():
    global currentProject
    global gitHandler

    currentProject = Project()
    return jsonify({"Success": "Project Initialized"}), 200

@app.route("/init_project_details", methods = ['POST'])
def init_project_details():

    global currentProject
    global gitHandler

    if not currentProject:
        return jsonify({"Error": "Project is not initialized"}), 400

    try:
        title = str(request.json['Title'])
        description = str(request.json['Description'])
        github_link = str(request.json['Github_Link'])
        github_token = str(request.json['Github_Token'])
    except Exception as e:
        return jsonify({"Error": "No Description or Title provided"}), 400
    
    deadline = ""
    techstack = ""
    shareholder = ""
    intensity = ""

    if "Deadline" in request.json:
        deadline = request.json['Deadline']


    if "Tech_Stack" in request.json:
        techstack = request.json['Tech_Stack']

    
    if "Shareholder" in request.json:
        shareholder = request.json['Shareholder']
    
    if "Intensity" in request.json:
        intensity = request.json["Intensity"]
    
    currentProject.add_details(title, description, deadline, techstack, shareholder, intensity)
    gitHandler = GitHubRepo(github_link, github_token)
    return jsonify({"Success": "Project Details Added"}), 200

@app.route("/get_project_title", methods=["GET"])
def get_project_title():
    global currentProject
    global gitHandler

    if not currentProject:
        return jsonify({"Error": "Project not initialized"}), 400
    
    return jsonify({"Project Title": currentProject.title})

@app.route("/get_project_description", methods=["GET"])
def get_project_description():
    global currentProject
    global gitHandler

    if not currentProject:
        return jsonify({"Error": "Project not initialized"}), 400
    
    return jsonify({"Project Title": currentProject.description})

@app.route("/start_project", methods = ['POST'])
def start_project():

    global currentProject
    global gitHandler

    if not currentProject:
        return jsonify({"Error": "Project not initialized"}), 400

    status = currentProject.generate_project()
    if status == 1:
        return jsonify({"Success": "Project generated succesfully"}), 200
    else:
        return jsonify({"Error": "Project generation failed"}), 400

@app.route('/add_member', methods = ['POST'])
def add_member():

    global currentProject
    global gitHandler

    if not currentProject:
        return jsonify({"Error": "Project not initialized"}), 400

    resume_file = None

    try:
        name = str(request.json['Name'])
        age = str(request.json['Age'])
        working_description = str(request.json['Working_Description'])
        title = str(request.json['Title'])
        year_of_exp = str(request.json['Years_of_Experience'])
        employee_id = str(request.json['Id'])
    except Exception as e:
        return jsonify({"Error": "Parsing Error for Member"}), 400


    if "Resume" in request.json:
        resume_file = request.json['Resume']

    # parse the resume
    resume = ""

    if resume_file is not None:
        try:
            reader = PyPDF2.PdfReader(resume_file)
            resume = "".join([page.extract_text() or "" for page in reader.pages])
        except Exception as e:
            return jsonify({"Error": "Could not Parse Resume"}), 400

    current_member = MemberData(name, age, working_description, resume, title, year_of_exp, employee_id)
    currentProject.addMember(current_member)
    return jsonify({"Success": "Member Added"}), 200

@app.route('/remove_member', methods=['POST'])
def remove_member():
    global currentProject
    global gitHandler

    if not currentProject:
        return jsonify({"Error": "Project not initialized"}), 400
    
    try:
        member_id = int(request.json["member_id"])
    except:
        return jsonify({"Error": "Incorrect Input for Member"}), 400

    members = currentProject.members
    
    for m in members:
        if m.employee_id == member_id:
            currentProject.members.remove(m)
            break
    
    return jsonify({"Success": "Member Removed"}), 200


@app.route("/standup", methods = ["POST"])
def standup():
    global currentProject
    global gitHandler

    if currentProject is None:
        return jsonify({"Error": "Could not get tickets because current project has not been inited"}), 400

    query = ""
    employee_id = ""

    try:
        query = str(response.json["query"])
        employee_id = str(response.json['id'])
    except Exception as e:
        print(e)
        return jsonify({"Error": "Query or ID not in response"}), 400


    status = currentProject.standup(query, employee_id)

    if status == 1:
        return jsonify({"Success": "Project updated succesfully"}), 200
    else:
        return jsonify({"Error": "Project update failed"}), 400

    



@app.route("/get_tickets", methods = ["GET"])
def get_tickets():

    global currentProject
    global gitHandler

    if currentProject is None:
        return jsonify({"Error": "Could not get tickets because current project has not been inited"}), 400

    return jsonify({"Data":currentProject.get_tickets_json()}), 200


@app.route("/update_tickets", methods = ["POST"])
def update_tickets():
    global currentProject
    global gitHandler

    if currentProject is None:
        return jsonify({"Error": "Could not get tickets because current project has not been inited"}), 400
    
    try:
        tickets = json.loads(request.json['tickets'])
    except:
        return jsonify({"Error": "Missing/Incorrect Input"}), 400

    print(tickets)

    currentProject.distribute_tickets(tickets)
    

    return jsonify({"Success": "Updated Tickets."}), 200


@app.route("/add_ticket", methods=['POST'])
def add_ticket():
    global currentProject
    if currentProject is None:
        return jsonify({"Error": "Could not add ticket because current project has not been inited"}), 400

    print("before the try")
    try:
        dev_type = str(request.json['dev_type'])
        title = str(request.json['title'])
        description = str(request.json['description'])
        assignments = list(request.json['assignments'])
        deadline = str(request.json["deadline"])
        category = str(request.json["category"])
        priority = int(request.json["priority"])

    except Exception as e:
        return jsonify({"Error": "Missing Input"}), 400
    
    print("here")

    ticket = Ticket(dev_type, title, description, assignments, deadline, category, priority)
    
    currentProject.addTicket(ticket)

    return jsonify({"Success": "Added new ticket."}), 200


@app.route("/get_single_ticket", methods = ['GET'])
def get_single_ticket():
    global currentProject
    
    if not currentProject:
        return jsonify({"Error": "Project not initialized"}), 400

    try:
        ticket_num = request.json["ticket_num"]
    except Exception as e:
        print(e)
        return jsonify({"Error": "Ticket Number not found in request"}), 400
    
    # GET ALL TICKETS
    ticket_jsons = currentProject.get_tickets_json()

    curr_ticket = None

    for ticket in ticket_jsons:
        if ticket['ticket_num'] == ticket_num:
            curr_ticket = ticket
            break 
    
    if curr_ticket is None:
        return jsonify({"Error": "Could not find ticket"}), 400
    
    return jsonify({"Success": curr_ticket}), 200

@app.route("/analyze_commit", methods = ["GET"])
def analyze_commit():
    global currentProject
    global gitHandler

    commit_hash = None
    try:
        commit_hash = str(request.json['hash'])
    except Exception as e:
        print(e)
        return jsonify({"Error": "Hash not present in request"}), 400

    if commit_hash is None:
        return jsonify({"Error": "Error getting hash from request"}), 400

    commit = gitHandler.get_commit_content(commit_hash)
    if commit is None:
        return jsonify({"Error": "Could not get commit based on hash"}), 400
    
    commit_message, commit_content = commit

    analyzation = currentProject.analyze_commit(commit_content)

    return jsonify({"Success": analyzation}), 400

    

    


@app.route("/get_ticket_github_detail", methods = ['GET'])
def get_ticket_detail():

    global currentProject
    global gitHandler

    if not gitHandler:
        return jsonify({"Error": "Github not set up correctly"}), 400
    

    if "ticket_num" not in request.json:
        return jsonify({"Error": "Ticket Num Does Not Exist"}), 400
    
    limit = 5
    if "limit" in request.json:
        try:
            limit = int(request.json['limit'])
        except Exception as e:
            print(e)
            return jsonify({"Error": "Could not parse limit"}), 400


    try:
        curr_num = request.json['ticket_num']
    except Exception as e:
        print(e)
        return jsonify({"Error": "Could not parse ticket number"}), 400


    gitHandler.fetch_new_commits()
    all_commits = gitHandler.get_all_commits()

    tickets = currentProject.compile_tickets()
    curr_ticket = None
    for ticket in tickets:
        if ticket.ticket_num == curr_num:
            curr_ticket = ticket
            break 
    
    if curr_ticket is None:
        return jsonify({"Error": "Ticket was not found"}), 400

    # now I need to search the commits, its in order

    # LIMIT OF 5 by default
    commit_list = []
    for commit_hash, (commit_message, _) in all_commits.items():
        # check if the ticket number appears in the commit_message
        if curr_num in commit_message:
            curr_json = {
                'hash': commit_hash,
                'message': commit_message,
                'url': gitHandler.get_commit_link(commit_hash)
            }
            commit_list.append(curr_json)
        if len(commit_list) >= limit:
            break 
    
    commit_list = json.dumps(commit_list)
    return jsonify({"Success": commit_list}), 200
        


