import os
from git_handler import GitHubRepo

# set up repo link and GitHub token
repo_link = "https://github.com/JhaoZ/mirai"  # Replace with a small test repo if needed

# create GitHubRepo instance
repo = GitHubRepo(repo_link, token=None)

# fetch new commits
new_commits = repo.fetch_new_commits()

# print newly fetched commits
print("New Commits:")
for commit_hash, (commit_message, content) in new_commits.items():
    print(f"Commit: {commit_hash}\nMessage: {commit_message}\nContent:\n{content}\n{'-'*80}")

# print all stored commits so far
all_commits = repo.get_all_commits()
print("\nAll Stored Commits:")
for commit_hash, (commit_message, content) in all_commits.items():
    print(f"Commit: {commit_hash}\nMessage: {commit_message}\nContent:\n{content}\n{'-'*80}")