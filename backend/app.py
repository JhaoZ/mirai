from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
import PyPDF2
from member import MemberData
from project import Project
from git_handler import GitHubRepo
from ticket import Ticket


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

@app.route("/start_project", methods = ['POST'])
def start_project():

    global currentProject
    global gitHandler

    if not currentProject:
        return jsonify({"Error": "Project not initialized"})

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

    try:
        name = str(request.json['Name'])
        working_description = str(request.json['Working_Description'])
        resume_file = request.json['Resume']
        title = str(request.json['Title'])
        year_of_exp = str(request.json['Years_of_Experience'])
        employee_id = str(request.json['Id'])
    except Exception as e:
        return jsonify({"Error": "Parsing Error for Member"}), 400


    # parse the resume

    try:
        reader = PyPDF2.PdfReader(resume_file)
        resume = "".join([page.extract_text() or "" for page in reader.pages])
    except Exception as e:
        return jsonify({"Error": "Could not Parse Resume"}), 400

    current_member = MemberData(name, age, working_description, resume, title, year_of_exp, employee_id)
    currentProject.addMember(current_member)
    return jsonify({"Success": "Member Added"}), 200


@app.route("/get_tickets", methods = ["GET"])
def get_tickets():

    global currentProject
    global gitHandler

    if currentProject is None:
        return jsonify({"Error": "Could not get tickets because current project has not been inited"})

    return jsonify({"Data":currentProject.get_tickets_json()})

@app.route("/get_ticket_detail", methods = ['GET'])
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
    for commit_hash, (commit_message, content) in all_commits.items():
        # check if the ticket number appears in the commit_message
        if curr_num in commit_message:
            curr_json = {
                'hash': commit_hash,
                'message': commit_message,
                'content': content
            }
            commit_list.append()
        if len(commit_list) >= limit:
            break 
    
    commit_list = json.dumps(commit_list)
    return jsonify({"Success": commit_list}), 400
        


