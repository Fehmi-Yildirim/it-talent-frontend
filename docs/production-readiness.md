# Frontend Production Readiness

## Automated checks

| Check                  | Result                           |
| ---------------------- | -------------------------------- |
| `npm run lint`         | PASS - 0 warnings, 0 errors      |
| `npm test`             | PASS - 28 files, 248 tests       |
| `npm run build`        | PASS                             |
| `npm run format:check` | FAIL - 140 files need formatting |

## Environment configuration

- Configure `VITE_API_BASE_URL` for the target environment.
- Never put secrets in `VITE_*` variables.
- Do not commit local `.env` files.

## Critical user journeys

- [ ] Login and logout
- [ ] Session restoration
- [ ] Role-based navigation and access
- [ ] Jobs listing and details
- [ ] Application submission and status
- [ ] CV upload, if supported
- [ ] Loading, error, and empty states

## Deployment and rollback

- [ ] Confirm CI status.
- [ ] Confirm production API configuration.
- [ ] Record release commit and approval.
- [ ] Verify deployed app and critical user journeys.
- [ ] Document rollback procedure.
- [ ] Verify app after rollback.

## Release decision

- Decision: Pending
- Release commit: Pending
- Approver: Pending
- Outstanding risks: Formatting check fails; production checks remain.
- Approved exceptions: None recorded
