import { wf_technical_leader } from './wf_technical_leader'
import { wf_repositories_data } from './wf_repositories_data'
import { wf_repositories_log } from './wf_repositories_log'
import { bo_members_activity_data } from './bo_members_activity'
import { bo_members_team_data } from './bo_members_team'
import { bo_members_activity_fk_data } from './bo_members_activity_fk'
import { bo_repositories_activity_data } from './bo_repository_branches_activity'
import { bo_open_pull_requests_data } from './bo_open_pull_requests'
import { bo_repository_threshold_activity_data } from './bo_repository_threshold_activity'
import { bo_repository_workflows_activity_data } from './bo_repository_workflows_activity'

export const server = {
  wf_technical_leader,
  wf_repositories_data,
  wf_repositories_log,
  bo_members_activity_data,
  bo_members_team_data,
  bo_members_activity_fk_data,
  bo_repositories_activity_data,
  bo_open_pull_requests_data,
  bo_repository_threshold_activity_data,
  bo_repository_workflows_activity_data
}