import { Link } from "react-router-dom";

export function AdminPage() {
  return <div>
    <Link to="/app/admin/create-invite">Create Invitation</Link>
    <Link to="/app/admin/feedback">View Feedback</Link>
  </div>
}