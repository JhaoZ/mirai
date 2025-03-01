import requests
import base64

class GitHubRepo:
    def __init__(self, repo_url, token):
        """Initialize the GitHubRepo object with the repository URL and authentication token."""
        parts = repo_url.rstrip('/').split('/')
        self.owner, self.repo = parts[-2], parts[-1]
        self.token = token
        self.commits_url = f"https://api.github.com/repos/{self.owner}/{self.repo}/commits"
        self.headers = {"Authorization": f"token {self.token}"} if self.token else {}
        self.commit_map = {}
        # track most recent commit stored
        self.commit_num = 0

    def fetch_new_commits(self):
        """Fetch new commits that haven't been stored yet and update the commit_map."""
        response = requests.get(self.commits_url, headers=self.headers)

        if response.status_code != 200:
            try:
                error_message = response.json().get('message', 'Unknown error')
            except Exception:
                error_message = response.text  # If JSON parsing fails, use raw text

            raise Exception(f"Error fetching commits: {error_message}")
        
        commits = response.json()
        new_commits = {}

        curr_commit_num = self.commit_num

        for commit in commits[curr_commit_num:]:
            commit_hash = commit['sha']

            commit_message = commit['commit']['message']

            tree_url = commit['commit']['tree']['url']
            tree_response = requests.get(tree_url, headers=self.headers)

            if tree_response.status_code != 200:
                continue

            tree = tree_response.json()
            file_contents = []

            def fetch_files(tree_url):
                tree_response = requests.get(tree_url, headers=self.headers)
                if tree_response.status_code != 200:
                    return []

                tree_data = tree_response.json()
                file_data_list = []

                for item in tree_data.get('tree', []):
                    if item['type'] == 'blob':  # Regular file

                        if item['path'].endswith('.pyc'):
                            continue  
                
                        file_response = requests.get(item['url'], headers=self.headers)
                        if file_response.status_code == 200:
                            file_data = file_response.json()

                            if 'content' in file_data:
                                try:
                                    content = base64.b64decode(file_data['content']).decode('utf-8', errors='ignore')
                                except Exception as e:
                                    content = f"[Error decoding file: {e}]"
                            else:
                                content = "[No content available]"

                            file_data_list.append(f"\nFile: {item['path']}\n{content}")

                    elif item['type'] == 'tree':  # Folder (subdirectory)
                        file_data_list.extend(fetch_files(item['url']))  # Recursive call

                return file_data_list

            # Fetch all files recursively
            file_contents.extend(fetch_files(tree_url))
            commit_content = "\n".join(file_contents)

            self.commit_map[commit_hash] = (commit_message, commit_content)
            new_commits[commit_hash] = (commit_message, commit_content)
            
            self.commit_num += 1
        
        return new_commits

    def get_commit_content(self, commit_hash):
        """Return the commit message and file contents for a given commit hash."""
        if commit_hash in self.commit_map:
            return self.commit_map[commit_hash]
        else:
            return None  
    
    def get_all_commits(self):
        """Return all stored commits and their content."""
        return self.commit_map
            