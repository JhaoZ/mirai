from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
import PyPDF2
from member import MemberData
from project import Project


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

currentProject = None



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
    return jsonify({"Success": "Project Details Added"}), 200
        

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



