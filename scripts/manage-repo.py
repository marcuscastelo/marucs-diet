#!/usr/bin/env python3

"""
Clears all deployments from a given repo

Requirements: pip install PyGithub 
Usage: GITHUB_ACCESS_TOKEN=${MY_PAT} REPO_NAME=twbs/bootstrap delete_deployments.py
"""

import datetime
import time
from github import Github
import os

def main():
    client = Github(os.environ["GITHUB_ACCESS_TOKEN"])

    repo = client.get_repo(os.environ["REPO_NAME"])

    for issue in repo.get_issues(state='open'):
        today = datetime.datetime.today()
        created_before_today = issue.created_at < today
        if created_before_today and issue.user.login == 'github-actions[bot]':
           issue.edit(body='Stale')

    # for issue in repo.get_issues(state='open'):
    #     for comment in issue.get_comments():
    #         if comment.user.login == 'github-actions[bot]':
    #           print('Deleting comment: ' + comment.body)
    #           print('Issue: ' + issue.title)
    #           print('Issue URL: ' + issue.url)
    #           today = datetime.datetime.today()
    #           created_before_today = comment.created_at < today
    #           if created_before_today:
    #             comment.delete()
    #             issue.create_comment('Deleting TODO comment because it was created before The Day')
    #             time.sleep(1)

if __name__ == "__main__":
    main()
