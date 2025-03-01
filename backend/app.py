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



@app.route('/', methods = ['GET'])
def home():
    return jsonify({'Home':'home'})

@app.route("/init_project", methods = ['PUT'])
def init_project():
    currentProject = Project()
    return jsonify({"Success": "Project Initialized"}), 200

@app.route("/init_project_details", methods = ['PUT'])
def init_project_details():
    try:
        title = str(request['Title'])
        description = str(request['Description'])
        github_link = str(request['Github_Link'])
        github_token = str(request['Github_Token'])
    except Exception as e:
        return jsonify({"Error": "No Description or Title provided"}), 400
    
    deadline = ""
    techstack = ""
    shareholder = ""
    intensity = ""

    if "Deadline" in request:
        deadline = request['Deadline']


    if "Tech_Stack" in request:
        techstack = request['Tech_Stack']

    
    if "Shareholder" in request:
        shareholder = request['Shareholder']
    
    if "Intensity" in request:
        intensity = request["Intensity"]
    
    currentProject.add_details(title, description, deadline, techstack, shareholder, intensity)
    gitHandler = GitHubRepo(github_link, github_token)
    return jsonify({"Success": "Project Details Added"}), 200

@app.route("/start_project", methods = ['PUT'])
def start_project():
    status = currentProject.generate_project()
    if status == 1:
        return jsonify({"Success": "Project generated succesfully"}), 200
    else:
        return jsonify({"Error": "Project generation failed"}), 400

@app.route('/add_member', methods = ['PUT'])
def add_member():

    if not currentProject:
        return jsonify({"Error": "Project not initialized"}), 400

    try:
        name = str(request['Name'])
        working_description = str(request['Working_Description'])
        resume_file = request['Resume']
        title = str(request['Title'])
        year_of_exp = str(request['Years_of_Experience'])
        employee_id = str(request['Id'])
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
    if currentProject is None:
        return jsonify({"Error": "Could not get tickets because current project has not been inited"})

    return jsonify({"Data":currentProject.get_tickets_json()})

@app.route("/get_ticket_detail", methods = ['GET'])
def get_ticket_detail():
    if not gitHandler:
        return jsonify({"Error": "Github not set up correctly"}), 400
    
    if "ticket_num" not in request:
        return jsonify({"Error": "Ticket Num Does Not Exist"}), 400


    curr_num = request['ticker_num']

    all_commits = gitHandler.get_all_commits()

    tickets = currentProject.compile_tickets()
    curr_ticket = None
    for ticket in tickets:
        if ticket.ticket_num == curr_num:
            curr_ticket = ticket
            break 
    
    if curr_ticket is None:
        return jsonify({"Error": "Ticker Number not found"}), 400

    # now I need to search the commits, its in order

    # LIMIT OF 5
