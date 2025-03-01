from git_handler import GitHubRepo

# Set up repository link (using a public repository)
repo_link = "https://github.com/JhaoZ/mirai"  # You can replace this with a smaller test repo

# Create GitHubRepo instance without authentication
repo = GitHubRepo(repo_link, token=None)  # Modify GitHubRepo to handle `None` token

# Fetch new commits
try:
    new_commits = repo.fetch_new_commits()
    for commit_hash, (commit_message, content) in new_commits.items():
        print(f"Commit: {commit_hash}\nMessage: {commit_message}\nContent:\n{content}\n{'-'*80}")
except Exception as e:
    print(f"Error fetching commits: {e}")