from project import Project
from member import MemberData

proj = Project()

proj.add_details("Cafe Chat App", "I want to build an app that connects people via coffee chats. It will match users and set up times to meet based on their coffee traits.", "May 2025", "", "", "", "www.github.com")
mem1 = MemberData("Bob Evan", 50, "Bob is a talented senior software engineer that excels at backend", "Previous at Apple, Senior SWE 10 years", "Senior SWE", 20, "bob12")
mem2 = MemberData("Chris Li", 24, "Chris is a new Software Engineer that started 2 years ago. He excels at QA", "Graduated from UCLA", "SWE", 2, "chris1")
mem3 = MemberData("Eva Jordans", 19, "Eva is an intern in the software engineer department with minimal experience in any field", "A junior at UW madison", "SWE Intern", 0, "ev1")

proj.addMember(mem1)
proj.addMember(mem2)
proj.addMember(mem3)

proj.generate_project()